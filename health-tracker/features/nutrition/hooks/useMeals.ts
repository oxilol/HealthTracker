import { useState, useEffect, useCallback } from 'react';
import { getToken } from '../../../lib/getToken';
import { Meal, MealFood, Food } from '../../../types/nutrition';

/* Hook to manage the user's saved meal library. 
   Calls /api/nutrition/meals. 
*/
export function useMeals() {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);


  const fetchMeals = useCallback(async () => {
    setLoading(true);
    try {
      const token = await getToken();
      if (!token) return;

      const res = await fetch('/api/nutrition/meals', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);
      const json = await res.json();
      setMeals(json.meals || []);
    } catch (err) {
      console.error('Error fetching meals:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchMeals(); }, [fetchMeals]);

  const createMeal = async (
    name: string,
    mealFoods: { food_id: string; quantity: number; unit: string }[],
    expirationDate?: string | null
  ) => {
    const token = await getToken();
    if (!token) return null;

    const res = await fetch('/api/nutrition/meals', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, meal_foods: mealFoods, expiration_date: expirationDate }),
    });
    if (!res.ok) return null;

    const json = await res.json();
    await fetchMeals();
    return json.meal as Meal;
  };

  const updateMeal = async (
    id: string,
    name: string,
    mealFoods: { food_id: string; quantity: number; unit: string }[],
    expirationDate?: string | null
  ) => {
    const token = await getToken();
    if (!token) return null;

    const res = await fetch(`/api/nutrition/meals?id=${id}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, meal_foods: mealFoods, expiration_date: expirationDate }),
    });
    if (!res.ok) return null;

    await fetchMeals();
    return true;
  };

  const deleteMeal = async (id: string) => {
    const token = await getToken();
    if (!token) return false;

    const res = await fetch(`/api/nutrition/meals?id=${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return false;

    await fetchMeals();
    return true;
  };

  // computes macro totals from a meal's food list
  const getMealNutrition = (meal: Meal) => {
    if (!meal.foods) return { calories: 0, protein: 0, carbohydrates: 0, fat: 0 };

    return meal.foods.reduce(
      (totals, mf: MealFood) => {
        const food = mf.food as Food | undefined;
        if (!food) return totals;
        const ratio = mf.quantity / food.base_quantity;
        return {
          calories: totals.calories + food.calories * ratio,
          protein: totals.protein + food.protein * ratio,
          carbohydrates: totals.carbohydrates + food.carbohydrates * ratio,
          fat: totals.fat + food.fat * ratio,
        };
      },
      { calories: 0, protein: 0, carbohydrates: 0, fat: 0 }
    );
  };

  return { meals, loading, createMeal, updateMeal, deleteMeal, getMealNutrition, refetch: fetchMeals };
}
