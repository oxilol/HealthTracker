import { useState, useEffect, useCallback } from 'react';
import { getToken } from '../../../lib/getToken';
import { CardioTemplate } from '../../../types/cardio';

/* Hook to manage the user's cardio templates.
   Calls /api/workouts/cardio/templates.
*/
export function useCardioTemplates() {
  const [templates, setTemplates] = useState<CardioTemplate[]>([]);
  const [loading, setLoading] = useState(true);


  const fetchTemplates = useCallback(async () => {
    setLoading(true);
    try {
      const token = await getToken();
      if (!token) return;

      const res = await fetch('/api/workouts/cardio/templates', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);
      const json = await res.json();
      setTemplates(json.templates || []);
    } catch (err) {
      console.error('Error fetching cardio templates:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTemplates(); }, [fetchTemplates]);

  const createTemplate = async (name: string, activities: { activity_name: string; activity_order: number }[]) => {
    const token = await getToken();
    if (!token) return null;

    const res = await fetch('/api/workouts/cardio/templates', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, activities }),
    });
    if (!res.ok) return null;

    const json = await res.json();
    await fetchTemplates();
    return json.template;
  };

  const updateTemplate = async (id: string, name: string, activities: { activity_name: string; activity_order: number }[]) => {
    const token = await getToken();
    if (!token) return;

    await fetch(`/api/workouts/cardio/templates?id=${id}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, activities }),
    });
    await fetchTemplates();
  };

  const deleteTemplate = async (id: string) => {
    const token = await getToken();
    if (!token) return;

    await fetch(`/api/workouts/cardio/templates?id=${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    await fetchTemplates();
  };

  return { templates, loading, fetchTemplates, createTemplate, updateTemplate, deleteTemplate };
}
