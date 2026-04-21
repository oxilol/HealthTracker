import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../services/supabaseClient';
import { WeightLog } from '../../../types/health';

/**
 * Hook to load and log body weight for a selected date.
 * Calls /api/health/weight
 */
export function useWeightData(dateStr: string) {
  const [weight, setWeight] = useState<WeightLog | null>(null);
  const [lastLoggedWeight, setLastLoggedWeight] = useState<WeightLog | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchWeight = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const res = await fetch(`/api/health/weight?date=${dateStr}`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (!res.ok) throw new Error(`Request failed: ${res.status}`);
      const json = await res.json();
      setWeight(json.weight);
      setLastLoggedWeight(json.lastLoggedWeight);
    } catch (err) {
      console.error('Error fetching weight:', err);
    } finally {
      setLoading(false);
    }
  }, [dateStr]);

  useEffect(() => {
    fetchWeight();
  }, [fetchWeight]);

  const logWeight = async (val: number) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return null;

      const res = await fetch('/api/health/weight', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ date: dateStr, weight: val }),
      });

      if (!res.ok) throw new Error(`Request failed: ${res.status}`);
      const json = await res.json();
      const logged = json.weight as WeightLog;

      setWeight(logged);
      if (!lastLoggedWeight || logged.date >= lastLoggedWeight.date) {
        setLastLoggedWeight(logged);
      }
      return json;
    } catch (err) {
      console.error('Error logging weight:', err);
      return null;
    }
  };

  return { weight, lastLoggedWeight, loading, logWeight, refresh: fetchWeight };
}
