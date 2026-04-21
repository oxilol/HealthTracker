"use client";

import { useState, useEffect } from 'react';
import { useNutritionStore } from '../../../store/nutritionStore';
import { useMeals } from '../hooks/useMeals';
import { useFoods } from '../hooks/useFoods';
import { Food } from '../../../types/nutrition';

interface MealFoodEntry {
  food: Food;
  quantity: number;
  unit: string;
}

export function CreateMealForm({ onSaved }: { onSaved?: () => void }) {
  const { showCreateMeal, setShowCreateMeal, editingMeal, setEditingMeal } = useNutritionStore();
  const { createMeal, updateMeal } = useMeals();
  const { foods } = useFoods();

  const [name, setName] = useState('');
  const [mealFoods, setMealFoods] = useState<MealFoodEntry[]>([]);
  const [hasExpiration, setHasExpiration] = useState(false);
  const [expirationDate, setExpirationDate] = useState('');
  const [showFoodPicker, setShowFoodPicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [saving, setSaving] = useState(false);

  const isEditing = !!editingMeal;

  // Populate form when editing
  useEffect(() => {
    if (editingMeal) {
      setName(editingMeal.name);
      setHasExpiration(!!editingMeal.expiration_date);
      setExpirationDate(editingMeal.expiration_date || '');

      if (editingMeal.foods) {
        const entries: MealFoodEntry[] = editingMeal.foods
          .filter((mf) => mf.food)
          .map((mf) => ({
            food: mf.food as Food,
            quantity: mf.quantity,
            unit: mf.unit,
          }));
        setMealFoods(entries);
      }
    }
  }, [editingMeal]);

  if (!showCreateMeal) return null;

  const filteredFoods = searchQuery.trim().length > 0
    ? foods.filter((f) => f.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : foods;

  const addFoodToMeal = (food: Food) => {
    setMealFoods((prev) => [
      ...prev,
      { food, quantity: food.base_quantity, unit: food.base_unit },
    ]);
    setShowFoodPicker(false);
    setSearchQuery('');
  };

  const removeFoodFromMeal = (index: number) => {
    setMealFoods((prev) => prev.filter((_, i) => i !== index));
  };

  const updateFoodQuantity = (index: number, quantity: string) => {
    setMealFoods((prev) =>
      prev.map((mf, i) => (i === index ? { ...mf, quantity: parseFloat(quantity) || 0 } : mf))
    );
  };

  const totalNutrition = mealFoods.reduce(
    (totals, mf) => {
      const ratio = mf.quantity / mf.food.base_quantity;
      return {
        calories: totals.calories + mf.food.calories * ratio,
        protein: totals.protein + mf.food.protein * ratio,
        carbohydrates: totals.carbohydrates + mf.food.carbohydrates * ratio,
        fat: totals.fat + mf.food.fat * ratio,
      };
    },
    { calories: 0, protein: 0, carbohydrates: 0, fat: 0 }
  );

  const resetForm = () => {
    setName('');
    setMealFoods([]);
    setHasExpiration(false);
    setExpirationDate('');
  };

  const handleClose = () => {
    resetForm();
    setEditingMeal(null);
    setShowCreateMeal(false);
  };

  const handleSave = async () => {
    if (!name.trim() || mealFoods.length === 0) return;
    setSaving(true);

    const foodEntries = mealFoods.map((mf) => ({
      food_id: mf.food.id,
      quantity: mf.quantity,
      unit: mf.unit,
    }));

    if (isEditing && editingMeal) {
      await updateMeal(
        editingMeal.id,
        name.trim(),
        foodEntries,
        hasExpiration ? expirationDate || null : null
      );
    } else {
      await createMeal(
        name.trim(),
        foodEntries,
        hasExpiration ? expirationDate || null : null
      );
    }

    setSaving(false);
    onSaved?.();
    handleClose();
  };

  return (
    <div className="fixed inset-0 z-[60] bg-neutral-950/95 backdrop-blur-sm flex flex-col animate-fade-in">
      <div className="w-full max-w-md mx-auto flex flex-col h-full animate-slide-up">
        {/* Header */}
        <div className="flex items-center gap-3 p-4 pt-6">
          <button
            onClick={handleClose}
            className="p-2 text-neutral-400 hover:text-neutral-200 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
          </button>
          <h2 className="text-lg font-semibold text-neutral-100">
            {isEditing ? 'Edit Meal' : 'Create Meal'}
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-6 space-y-4">
          {/* Meal name */}
          <div>
            <label className="block text-xs font-medium text-neutral-400 mb-1 ml-1">Meal Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Chicken Rice Bowl"
              className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-2xl text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-sm"
              autoFocus
            />
          </div>

          {/* Foods in meal */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-4 space-y-3 shadow-lg">
            <div className="h-full w-full space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-neutral-400 ml-1">Foods in Meal</p>
                <button
                  onClick={() => setShowFoodPicker(true)}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
                >
                  + Add Food
                </button>
              </div>

              {mealFoods.length === 0 && (
                <p className="text-center text-neutral-600 text-xs py-4">No foods added yet</p>
              )}

              {mealFoods.map((mf, index) => (
                <div key={index} className="flex items-center gap-2 bg-neutral-800/50 rounded-xl p-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-neutral-200 truncate">{mf.food.name}</p>
                  </div>
                  <input
                    type="number"
                    inputMode="decimal"
                    value={mf.quantity}
                    onChange={(e) => updateFoodQuantity(index, e.target.value)}
                    className="w-16 px-2 py-1.5 bg-neutral-700 border border-neutral-600 rounded-lg text-neutral-100 text-xs text-center focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
                  />
                  <span className="text-xs text-neutral-500 w-6">{mf.unit}</span>
                  <button
                    onClick={() => removeFoodFromMeal(index)}
                    className="p-1 text-neutral-600 hover:text-red-400 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}

              {/* Meal totals */}
              {mealFoods.length > 0 && (
                <div className="bg-neutral-800/30 rounded-xl p-3 grid grid-cols-4 gap-2 text-center">
                  <div>
                    <span className="text-xs font-semibold text-indigo-400">{Math.round(totalNutrition.calories)}</span>
                    <p className="text-[9px] text-neutral-500">cal</p>
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-emerald-400">{Math.round(totalNutrition.protein)}g</span>
                    <p className="text-[9px] text-neutral-500">protein</p>
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-amber-400">{Math.round(totalNutrition.carbohydrates)}g</span>
                    <p className="text-[9px] text-neutral-500">carbs</p>
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-red-400">{Math.round(totalNutrition.fat)}g</span>
                    <p className="text-[9px] text-neutral-500">fat</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Expiration date */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-4 space-y-3 shadow-lg">
            <div className="w-full h-full space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-neutral-400 ml-1">Temporary Meal</p>
                  <p className="text-[11px] text-neutral-600 ml-1 mt-0.5">Set expiration for weekly meal prep</p>
                </div>
                <button
                  onClick={() => setHasExpiration(!hasExpiration)}
                  className={`w-11 h-6 rounded-full transition-colors relative ${hasExpiration ? 'bg-indigo-600' : 'bg-neutral-700'
                    }`}
                >
                  <div
                    className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${hasExpiration ? 'translate-x-[22px]' : 'translate-x-0.5'
                      }`}
                  />
                </button>
              </div>

              {hasExpiration && (
                <input
                  type="date"
                  value={expirationDate}
                  onChange={(e) => setExpirationDate(e.target.value)}
                  className="w-full px-3 py-2.5 bg-neutral-800 border border-neutral-700 rounded-xl text-neutral-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                />
              )}
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={saving || !name.trim() || mealFoods.length === 0}
            className="w-full py-3 rounded-2xl text-sm font-medium text-white bg-indigo-500/20 hover:bg-indigo-500/30 backdrop-blur-md border border-indigo-500/30 disabled:opacity-40 transition-colors shadow-sm"
          >
            {saving ? 'Saving...' : isEditing ? 'Update Meal' : 'Save Meal'}
          </button>
        </div>

        {/* Food picker overlay */}
        {showFoodPicker && (
          <div className="absolute inset-0 bg-neutral-950/98 z-10 flex flex-col animate-fade-in">
            <div className="w-full max-w-md mx-auto flex flex-col h-full">
              <div className="flex items-center gap-3 p-4 pt-6">
                <button
                  onClick={() => {
                    setShowFoodPicker(false);
                    setSearchQuery('');
                  }}
                  className="p-2 text-neutral-400 hover:text-neutral-200 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                  </svg>
                </button>
                <input
                  type="text"
                  placeholder="Search your foods..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-2xl text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-sm"
                  autoFocus
                />
              </div>

              <div className="flex-1 overflow-y-auto px-4 pb-6">
                {filteredFoods.length === 0 && (
                  <p className="text-center text-neutral-500 text-sm py-8">
                    No custom foods found. Create foods first to add them to meals.
                  </p>
                )}

                <div className="space-y-2">
                  {filteredFoods.map((food) => (
                    <button
                      key={food.id}
                      onClick={() => addFoodToMeal(food)}
                      className="w-full text-left bg-neutral-900 border border-neutral-800 rounded-2xl p-4 hover:border-neutral-700 transition-colors"
                    >
                      <p className="text-sm font-medium text-neutral-200 truncate">{food.name}</p>
                      <div className="flex gap-3 mt-1">
                        <span className="text-xs text-indigo-400/80">{food.calories} cal</span>
                        <span className="text-[11px] text-neutral-500">per {food.base_quantity}{food.base_unit}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
