import { useState, useEffect } from 'react';
import { getToken } from '../../../lib/getToken';

export interface DailyStats {
  date: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  weight: number | null;
  steps: number;
  activeEnergy: number;
  hasWorkout: boolean;
  hasCardio: boolean;
}

/* Hook aggregating multiple health data into a daily stats array.
   Calls /api/stats/daily.
*/
export function useStats(days: number = 30) {
  const [stats, setStats] = useState<DailyStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      setLoading(true);
      try {
        const session_token = await getToken();
        if (!session_token) return;

        const res = await fetch(`/api/stats/daily?days=${days}`, {
          headers: { Authorization: `Bearer ${session_token}` },
        });
        if (!res.ok) throw new Error(`Request failed: ${res.status}`);
        const json = await res.json();
        setStats(json.stats || []);
      } catch (err) {
        console.error('Error fetching stats:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, [days]);

  return { stats, loading };
}
