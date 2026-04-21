import { useState, useEffect, useCallback } from 'react';
import { getToken } from '../../../lib/getToken';

interface DaySummary {
  date: string;
  sessionCount: number;
}

/* Hook to load gym session counts per day for a given month.
   Calls /api/workouts/calendar?type=gym.
*/
export function useWorkoutCalendar(month: number, year: number) {
  const [daySummaries, setDaySummaries] = useState<Map<string, DaySummary>>(new Map());
  const [loading, setLoading] = useState(true);


  const fetchMonth = useCallback(async () => {
    setLoading(true);
    try {
      const token = await getToken();
      if (!token) return;

      const res = await fetch(`/api/workouts/calendar?year=${year}&month=${month}&type=gym`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);
      const json = await res.json();

      const summaryMap = new Map<string, DaySummary>();
      for (const s of json.summaries || []) summaryMap.set(s.date, s);
      setDaySummaries(summaryMap);
    } catch (err) {
      console.error('Error fetching workout calendar:', err);
    } finally {
      setLoading(false);
    }
  }, [month, year]);

  useEffect(() => { fetchMonth(); }, [fetchMonth]);

  return { daySummaries, loading };
}
