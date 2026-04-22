import { useState, useEffect } from 'react';
import { getToken } from '../../../lib/getToken';
import { todayLocalStr, addDays } from '../../../lib/dateUtils';

export interface ExerciseMaxData {
  date: string;
  maxWeight: number;
}

/* Hook to load per-exercise max weight history over a date range.
   Calls /api/stats/exercise-maxes.
*/
export function useExerciseMaxes(days: number = 30, locationId?: string | null) {
  const [exercises, setExercises] = useState<string[]>([]);
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);
  const [maxData, setMaxData] = useState<ExerciseMaxData[]>([]);
  const [loading, setLoading] = useState(true);

  // Raw sets cached from API to avoid refetching on every dropdown change
  const [rawSets, setRawSets] = useState<any[]>([]);

  useEffect(() => {
    async function fetchSets() {
      setLoading(true);
      try {
        const session_token = await getToken();
        if (!session_token) return;

        const params = new URLSearchParams({ days: String(days) });
        if (locationId) params.set('location_id', locationId);

        const res = await fetch(`/api/stats/exercise-maxes?${params.toString()}`, {
          headers: { Authorization: `Bearer ${session_token}` },
        });
        if (!res.ok) throw new Error(`Request failed: ${res.status}`);
        const json = await res.json();
        const sets = json.sets || [];

        setRawSets(sets);
        setSelectedExercise(null);

        const unique = Array.from(new Set(sets.map((s: any) => s.exercise_name))).sort() as string[];
        setExercises(unique);

        if (unique.length > 0) {
          setSelectedExercise(unique[0]);
        }
      } catch (err) {
        console.error('Error fetching exercise sets:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchSets();
  }, [days, locationId]);

  // Derive maxData whenever `selectedExercise` or raw data changes
  useEffect(() => {
    if (!selectedExercise) return;

    const filtered = rawSets.filter((s) => s.exercise_name === selectedExercise);

    const maxByDate = new Map<string, number>();
    for (const s of filtered) {
      const current = maxByDate.get(s.date) || 0;
      if (s.weight > current) maxByDate.set(s.date, s.weight);
    }

    const today = todayLocalStr();
    const generated: ExerciseMaxData[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const dateStr = addDays(today, -i);
      generated.push({
        date: dateStr,
        maxWeight: maxByDate.get(dateStr) || null as any,
      });
    }

    setMaxData(generated);
  }, [selectedExercise, rawSets, days]);

  return { exercises, selectedExercise, setSelectedExercise, maxData, loading };
}
