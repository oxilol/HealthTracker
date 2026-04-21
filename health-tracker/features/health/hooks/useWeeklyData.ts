import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../services/supabaseClient';
import { HealthMetrics } from '../../../types/health';
import { addDays } from '../../../lib/dateUtils';

export interface DayHealthSummary {
  date: string;
  metrics: HealthMetrics | null;
  calories: number;
  protein: number;
  hasWorkout: boolean;
}

/**
 * Hook to load a 7-day health summary (Sat–Fri) via the weekly API route.
 */
export function useWeeklyData(weekSat: string) {
  const [days, setDays] = useState<DayHealthSummary[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWeek = useCallback(async () => {
    if (!weekSat) return;
    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const res = await fetch(`/api/health/weekly?weekSat=${weekSat}`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (!res.ok) throw new Error(`Request failed: ${res.status}`);
      const json = await res.json();
      setDays(json.days);
    } catch (err) {
      console.error('Error fetching weekly data:', err);
      // Fall back to empty days so the week grid doesn't break
      const dates = Array.from({ length: 7 }, (_, i) => addDays(weekSat, i));
      setDays(dates.map((d) => ({ date: d, metrics: null, calories: 0, protein: 0, hasWorkout: false })));
    } finally {
      setLoading(false);
    }
  }, [weekSat]);

  useEffect(() => { fetchWeek(); }, [fetchWeek]);

  return { days, loading };
}
