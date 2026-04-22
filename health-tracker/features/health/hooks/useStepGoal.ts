import { useState, useEffect, useCallback } from 'react';
import { getToken } from '../../../lib/getToken';

const DEFAULT_STEP_GOAL = 10000;

/**
 * Fetches the user's daily step goal from the database.
 */
export function useStepGoal() {
  const [stepGoal, setStepGoal] = useState(DEFAULT_STEP_GOAL);
  const [loading, setLoading] = useState(true);

  const fetchStepGoal = useCallback(async () => {
    try {
      const token = await getToken();
      if (!token) return;

      const res = await fetch('/api/profile', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;

      const data = await res.json();
      if (typeof data.step_goal === 'number' && data.step_goal > 0) {
        setStepGoal(data.step_goal);
      }
    } catch {
      // Fall back to default
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStepGoal();
  }, [fetchStepGoal]);

  const updateStepGoal = useCallback(async (value: number) => {
    if (value <= 0) return;
    setStepGoal(value);

    try {
      const token = await getToken();
      if (!token) return;

      await fetch('/api/profile', {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ step_goal: value }),
      });
    } catch {
    }
  }, []);

  return { stepGoal, loading, updateStepGoal };
}
