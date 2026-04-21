import { useState, useEffect, useCallback } from 'react';
import { getToken } from '../../../lib/getToken';
import { NutritionLog } from '../../../types/nutrition';
import { todayLocalStr } from '../../../lib/dateUtils';

/* Hook to manage daily food logs. 
   Calls /api/nutrition/logs. 
*/
export function useNutritionLogs(date?: string) {
  const [logs, setLogs] = useState<NutritionLog[]>([]);
  const [loading, setLoading] = useState(true);

  const logDate = date || todayLocalStr();


  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const token = await getToken();
      if (!token) return;

      const res = await fetch(`/api/nutrition/logs?date=${logDate}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);
      const json = await res.json();
      setLogs(json.logs || []);
    } catch (err) {
      console.error('Error fetching nutrition logs:', err);
    } finally {
      setLoading(false);
    }
  }, [logDate]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const addLog = async (logData: {
    food_id?: string | null;
    meal_id?: string | null;
    quantity: number;
    unit: string;
    calories: number;
    protein: number;
    carbohydrates: number;
    fat: number;
    name?: string;
  }) => {
    const token = await getToken();
    if (!token) return null;

    const res = await fetch('/api/nutrition/logs', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...logData, log_date: logDate }),
    });
    if (!res.ok) return null;

    const json = await res.json();
    const newLog = json.log as NutritionLog;
    setLogs((prev) => [...prev, newLog]);
    return newLog;
  };

  const deleteLog = async (id: string) => {
    const token = await getToken();
    if (!token) return;

    const res = await fetch(`/api/nutrition/logs?id=${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      setLogs((prev) => prev.filter((l) => l.id !== id));
    }
  };

  const totals = logs.reduce(
    (acc, log) => ({
      calories: acc.calories + (log.calories || 0),
      protein: acc.protein + (log.protein || 0),
      carbohydrates: acc.carbohydrates + (log.carbohydrates || 0),
      fat: acc.fat + (log.fat || 0),
    }),
    { calories: 0, protein: 0, carbohydrates: 0, fat: 0 }
  );

  return { logs, loading, addLog, deleteLog, totals, refetch: fetchLogs };
}
