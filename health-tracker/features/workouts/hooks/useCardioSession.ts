import { useState, useEffect, useCallback } from 'react';
import { getToken } from '../../../lib/getToken';
import { CardioSession, CardioLog, CardioTemplate } from '../../../types/cardio';
import { todayLocalStr } from '../../../lib/dateUtils';

/* Hook to manage cardio sessions for a given date.
   Calls /api/workouts/cardio/sessions and /api/workouts/cardio/logs.
*/
export function useCardioSession(date?: string) {
  const [sessions, setSessions] = useState<CardioSession[]>([]);
  const [logs, setLogs] = useState<CardioLog[]>([]);
  const [loading, setLoading] = useState(true);

  const sessionDate = date || todayLocalStr();


  const fetchSessions = useCallback(async () => {
    setLoading(true);
    try {
      const token = await getToken();
      if (!token) return;

      const res = await fetch(`/api/workouts/cardio/sessions?date=${sessionDate}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);
      const json = await res.json();
      setSessions(json.sessions || []);
      setLogs(json.logs || []);
    } catch (err) {
      console.error('Error fetching cardio sessions:', err);
    } finally {
      setLoading(false);
    }
  }, [sessionDate]);

  useEffect(() => { fetchSessions(); }, [fetchSessions]);

  const startSession = async (template: CardioTemplate) => {
    const token = await getToken();
    if (!token) return null;

    const res = await fetch('/api/workouts/cardio/sessions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ template_id: template.id, date: sessionDate }),
    });
    if (!res.ok) return null;

    const json = await res.json();
    const newSession = json.session as CardioSession;
    setSessions((prev) => [...prev, newSession]);
    return newSession;
  };

  const addLog = async (activityName: string, durationMinutes: number | null, distanceKm: number | null, sessionId: string) => {
    const token = await getToken();
    if (!token) return null;

    const logNumber = logs.filter((l) => l.session_id === sessionId && l.activity_name === activityName).length + 1;

    const res = await fetch('/api/workouts/cardio/logs', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: sessionId, activity_name: activityName, log_number: logNumber, duration_minutes: durationMinutes, distance_km: distanceKm }),
    });
    if (!res.ok) return null;

    const json = await res.json();
    const newLog = json.log as CardioLog;
    setLogs((prev) => [...prev, newLog]);
    return newLog;
  };

  const deleteLog = async (logId: string) => {
    const token = await getToken();
    if (!token) return;

    const res = await fetch(`/api/workouts/cardio/logs?id=${logId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) setLogs((prev) => prev.filter((l) => l.id !== logId));
  };

  const endSession = async (sessionId: string) => {
    const token = await getToken();
    if (!token) return;

    const res = await fetch(`/api/workouts/cardio/sessions?id=${sessionId}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) setSessions((prev) => prev.map((s) => s.id === sessionId ? { ...s, is_completed: true } : s));
  };

  const deleteSession = async (sessionId: string) => {
    const token = await getToken();
    if (!token) return;

    const res = await fetch(`/api/workouts/cardio/sessions?id=${sessionId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
      setLogs((prev) => prev.filter((l) => l.session_id !== sessionId));
    }
  };

  return { sessions, logs, loading, startSession, endSession, addLog, deleteLog, deleteSession, refetch: fetchSessions };
}
