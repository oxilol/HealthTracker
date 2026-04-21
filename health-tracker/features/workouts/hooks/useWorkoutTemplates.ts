import { useState, useEffect, useCallback } from 'react';
import { getToken } from '../../../lib/getToken';
import { WorkoutTemplate, TemplateExercise } from '../../../types/workout';

/* Hook to manage the user's gym workout templates.
   Calls /api/workouts/templates.
*/
export function useWorkoutTemplates() {
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);
  const [loading, setLoading] = useState(true);


  const fetchTemplates = useCallback(async () => {
    setLoading(true);
    try {
      const token = await getToken();
      if (!token) return;

      const res = await fetch('/api/workouts/templates', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);
      const json = await res.json();
      setTemplates(json.templates || []);
    } catch (err) {
      console.error('Error fetching workout templates:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTemplates(); }, [fetchTemplates]);

  const createTemplate = async (name: string, exercises: { exercise_name: string; exercise_order: number }[]) => {
    const token = await getToken();
    if (!token) return null;

    const res = await fetch('/api/workouts/templates', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, exercises }),
    });
    if (!res.ok) return null;

    const json = await res.json();
    await fetchTemplates();
    return json.template;
  };

  const updateTemplate = async (id: string, name: string, exercises: { exercise_name: string; exercise_order: number }[]) => {
    const token = await getToken();
    if (!token) return;

    await fetch(`/api/workouts/templates?id=${id}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, exercises }),
    });
    await fetchTemplates();
  };

  const deleteTemplate = async (id: string) => {
    const token = await getToken();
    if (!token) return;

    await fetch(`/api/workouts/templates?id=${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    await fetchTemplates();
  };

  return { templates, loading, fetchTemplates, createTemplate, updateTemplate, deleteTemplate };
}
