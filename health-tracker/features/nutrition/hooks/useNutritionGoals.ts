import { useState, useEffect, useCallback } from 'react';
import { getToken } from '../../../lib/getToken';
import { NutritionGoals } from '../../../types/nutrition';

/* Hook to fetch and save the user's daily macro/calorie goals. 
   Calls /api/nutrition/goals. 
*/
export function useNutritionGoals() {
  const [goals, setGoals] = useState<NutritionGoals | null>(null);
  const [loading, setLoading] = useState(true);


  const fetchGoals = useCallback(async () => {
    setLoading(true);
    try {
      const token = await getToken();
      if (!token) return;

      const res = await fetch('/api/nutrition/goals', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);
      const json = await res.json();
      setGoals(json.goals);
    } catch (err) {
      console.error('Error fetching nutrition goals:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchGoals(); }, [fetchGoals]);

  const upsertGoals = async (goalData: Partial<NutritionGoals>) => {
    const token = await getToken();
    if (!token) return;

    const res = await fetch('/api/nutrition/goals', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(goalData),
    });
    if (!res.ok) return;

    const json = await res.json();
    setGoals(json.goals);
  };

  return { goals, loading, upsertGoals, refetch: fetchGoals };
}
