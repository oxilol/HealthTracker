import { useState, useEffect, useCallback } from 'react';
import { getToken } from '../../../lib/getToken';
import { Food } from '../../../types/nutrition';

/* Hook to manage the user's personal food library. 
   Calls /api/nutrition/foods. 
*/
export function useFoods() {
  const [foods, setFoods] = useState<Food[]>([]);
  const [loading, setLoading] = useState(true);


  const fetchFoods = useCallback(async () => {
    setLoading(true);
    try {
      const token = await getToken();
      if (!token) return;

      const res = await fetch('/api/nutrition/foods', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);
      const json = await res.json();
      setFoods(json.foods || []);
    } catch (err) {
      console.error('Error fetching foods:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchFoods(); }, [fetchFoods]);

  const createFood = async (foodData: Omit<Food, 'id' | 'user_id' | 'created_at'>) => {
    const token = await getToken();
    if (!token) return null;

    const res = await fetch('/api/nutrition/foods', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(foodData),
    });
    if (!res.ok) return null;

    const json = await res.json();
    await fetchFoods();
    return json.food as Food;
  };

  const updateFood = async (id: string, foodData: Partial<Omit<Food, 'id' | 'user_id' | 'created_at'>>) => {
    const token = await getToken();
    if (!token) return null;

    const res = await fetch(`/api/nutrition/foods?id=${id}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(foodData),
    });
    if (!res.ok) return null;

    const json = await res.json();
    await fetchFoods();
    return json.food as Food;
  };

  const deleteFood = async (id: string) => {
    const token = await getToken();
    if (!token) return false;

    const res = await fetch(`/api/nutrition/foods?id=${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return false;

    await fetchFoods();
    return true;
  };

  return { foods, loading, createFood, updateFood, deleteFood, refetch: fetchFoods };
}
