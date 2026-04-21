"use client";

import { useState, useEffect } from 'react';
import { useNutritionStore } from '../../../store/nutritionStore';
import { useFoods } from '../hooks/useFoods';

export function CreateFoodForm({ onSaved }: { onSaved?: () => void }) {
  const { showCreateFood, setShowCreateFood, editingFood, setEditingFood } = useNutritionStore();
  const { createFood, updateFood } = useFoods();

  const [name, setName] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [baseQuantity, setBaseQuantity] = useState('100');
  const [baseUnit, setBaseUnit] = useState('g');
  const [saving, setSaving] = useState(false);

  const isEditing = !!editingFood;

  // Populate form when editing
  useEffect(() => {
    if (editingFood) {
      setName(editingFood.name);
      setCalories(editingFood.calories.toString());
      setProtein(editingFood.protein.toString());
      setCarbs(editingFood.carbohydrates.toString());
      setFat(editingFood.fat.toString());
      setBaseQuantity(editingFood.base_quantity.toString());
      setBaseUnit(editingFood.base_unit);
    }
  }, [editingFood]);

  if (!showCreateFood) return null;

  const resetForm = () => {
    setName('');
    setCalories('');
    setProtein('');
    setCarbs('');
    setFat('');
    setBaseQuantity('100');
    setBaseUnit('g');
  };

  const handleClose = () => {
    resetForm();
    setEditingFood(null);
    setShowCreateFood(false);
  };

  const handleSave = async () => {
    if (!name.trim() || !calories) return;
    setSaving(true);

    const foodData = {
      name: name.trim(),
      calories: parseFloat(calories) || 0,
      protein: parseFloat(protein) || 0,
      carbohydrates: parseFloat(carbs) || 0,
      fat: parseFloat(fat) || 0,
      base_quantity: parseFloat(baseQuantity) || 100,
      base_unit: baseUnit,
    };

    if (isEditing && editingFood) {
      await updateFood(editingFood.id, foodData);
    } else {
      await createFood(foodData);
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
            {isEditing ? 'Edit Food' : 'Create Custom Food'}
          </h2>
        </div>

        {/* Form */}
        <div className="flex-1 overflow-y-auto px-4 pb-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-neutral-400 mb-1 ml-1">Food Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Homemade Granola"
              className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-2xl text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-sm"
              autoFocus
            />
          </div>

          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-4 space-y-3 shadow-lg">
            <div className="w-full space-y-3">
              <p className="text-xs font-medium text-neutral-400 ml-1">Nutrition per serving</p>

              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-[11px] text-neutral-500 mb-1 ml-1">Amount</label>
                  <input
                    type="number"
                    inputMode="decimal"
                    value={baseQuantity}
                    onChange={(e) => setBaseQuantity(e.target.value)}
                    className="w-full px-3 py-2.5 bg-neutral-800 border border-neutral-700 rounded-xl text-neutral-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                  />
                </div>
                <div className="w-24">
                  <label className="block text-[11px] text-neutral-500 mb-1 ml-1">Unit</label>
                  <select
                    value={baseUnit}
                    onChange={(e) => setBaseUnit(e.target.value)}
                    className="w-full px-3 py-2.5 bg-neutral-800 border border-neutral-700 rounded-xl text-neutral-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all appearance-none"
                  >
                    <option value="g">g</option>
                    <option value="ml">ml</option>
                    <option value="units">units</option>
                    <option value="portion">portion</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-neutral-500 mb-1 ml-1">Calories</label>
                <input
                  type="number"
                  inputMode="decimal"
                  value={calories}
                  onChange={(e) => setCalories(e.target.value)}
                  placeholder="0"
                  className="w-full px-3 py-2.5 bg-neutral-800 border border-neutral-700 rounded-xl text-neutral-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] text-emerald-400/60 mb-1 ml-1">Protein (g)</label>
                  <input
                    type="number"
                    inputMode="decimal"
                    value={protein}
                    onChange={(e) => setProtein(e.target.value)}
                    placeholder="0"
                    className="w-full px-3 py-2.5 bg-neutral-800 border border-neutral-700 rounded-xl text-neutral-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-amber-400/60 mb-1 ml-1">Carbs (g)</label>
                  <input
                    type="number"
                    inputMode="decimal"
                    value={carbs}
                    onChange={(e) => setCarbs(e.target.value)}
                    placeholder="0"
                    className="w-full px-3 py-2.5 bg-neutral-800 border border-neutral-700 rounded-xl text-neutral-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-red-400/60 mb-1 ml-1">Fat (g)</label>
                  <input
                    type="number"
                    inputMode="decimal"
                    value={fat}
                    onChange={(e) => setFat(e.target.value)}
                    placeholder="0"
                    className="w-full px-3 py-2.5 bg-neutral-800 border border-neutral-700 rounded-xl text-neutral-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={saving || !name.trim() || !calories}
            className="w-full py-3 rounded-2xl text-sm font-medium text-white bg-indigo-500/20 hover:bg-indigo-500/30 backdrop-blur-md border border-indigo-500/30 disabled:opacity-40 transition-colors shadow-sm"
          >
            {saving ? 'Saving...' : isEditing ? 'Update Food' : 'Save Food'}
          </button>
        </div>
      </div>
    </div>
  );
}
