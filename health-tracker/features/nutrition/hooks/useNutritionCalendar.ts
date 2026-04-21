import { useState, useEffect, useCallback } from 'react';
import { getToken } from '../../../lib/getToken';

interface DaySummary {
  date: string;
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
}

/* Hook to load daily nutrition totals for a given month. 
   Calls /api/nutrition/calendar. 
*/
export function useNutritionCalendar(month: number, year: number) {
  const [daySummaries, setDaySummaries] = useState<Map<string, DaySummary>>(new Map());
  const [loading, setLoading] = useState(true);


  const fetchMonth = useCallback(async () => {
    setLoading(true);
    try {
      const token = await getToken();
      if (!token) return;

      const res = await fetch(`/api/nutrition/calendar?year=${year}&month=${month}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);
      const json = await res.json();

      // Convert the array from the API into a Map keyed by date
      const summaryMap = new Map<string, DaySummary>();
      for (const summary of json.summaries || []) {
        summaryMap.set(summary.date, summary);
      }
      setDaySummaries(summaryMap);
    } catch (err) {
      console.error('Error fetching nutrition calendar:', err);
    } finally {
      setLoading(false);
    }
  }, [month, year]);

  useEffect(() => { fetchMonth(); }, [fetchMonth]);

  return { daySummaries, loading };
}
