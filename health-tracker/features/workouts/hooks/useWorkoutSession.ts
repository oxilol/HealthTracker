import { useState, useEffect, useCallback } from 'react';
import { getToken } from '../../../lib/getToken';
import { WorkoutSession, ExerciseSet, WorkoutTemplate } from '../../../types/workout';
import { todayLocalStr } from '../../../lib/dateUtils';

/* Hook to manage gym workout sessions for a given date.
   Calls /api/workouts/sessions and /api/workouts/sets.
*/
export function useWorkoutSession(date?: string) {
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [sets, setSets] = useState<ExerciseSet[]>([]);
  const [previousTemplateSets, setPreviousTemplateSets] = useState<ExerciseSet[]>([]);
  const [loading, setLoading] = useState(true);

  const sessionDate = date || todayLocalStr();


  const fetchSessions = useCallback(async () => {
    setLoading(true);
    try {
      const token = await getToken();
      if (!token) return;

      const res = await fetch(`/api/workouts/sessions?date=${sessionDate}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);
      const json = await res.json();

      setSessions(json.sessions || []);
      setSets(json.sets || []);
      setPreviousTemplateSets(json.previousTemplateSets || []);
    } catch (err) {
      console.error('Error fetching workout sessions:', err);
    } finally {
      setLoading(false);
    }
  }, [sessionDate]);

  useEffect(() => { fetchSessions(); }, [fetchSessions]);

  const startSession = async (template: WorkoutTemplate) => {
    const token = await getToken();
    if (!token) return null;

    const res = await fetch('/api/workouts/sessions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ template_id: template.id, date: sessionDate }),
    });
    if (!res.ok) return null;

    const json = await res.json();
    const newSession = json.session as WorkoutSession;
    setSessions((prev) => [...prev, newSession]);
    if (json.previousTemplateSets) setPreviousTemplateSets(json.previousTemplateSets);
    return newSession;
  };

  const addSet = async (exerciseName: string, weight: number | null, repetitions: number | null, sessionId: string) => {
    const token = await getToken();
    if (!token) return null;

    const setNumber = sets.filter((s) => s.session_id === sessionId && s.exercise_name === exerciseName).length + 1;

    const res = await fetch('/api/workouts/sets', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: sessionId, exercise_name: exerciseName, set_number: setNumber, weight, repetitions }),
    });
    if (!res.ok) return null;

    const json = await res.json();
    const newSet = json.set as ExerciseSet;
    setSets((prev) => [...prev, newSet]);
    return newSet;
  };

  const deleteSet = async (setId: string) => {
    const token = await getToken();
    if (!token) return;

    const res = await fetch(`/api/workouts/sets?id=${setId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) setSets((prev) => prev.filter((s) => s.id !== setId));
  };

  const endSession = async (sessionId: string) => {
    const token = await getToken();
    if (!token) return;

    const res = await fetch(`/api/workouts/sessions?id=${sessionId}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) setSessions((prev) => prev.map((s) => s.id === sessionId ? { ...s, is_completed: true } : s));
  };

  const deleteSession = async (sessionId: string) => {
    const token = await getToken();
    if (!token) return;

    const res = await fetch(`/api/workouts/sessions?id=${sessionId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
      setSets((prev) => prev.filter((s) => s.session_id !== sessionId));
    }
  };

  return { sessions, sets, previousTemplateSets, loading, startSession, endSession, addSet, deleteSet, deleteSession, refetch: fetchSessions };
}
