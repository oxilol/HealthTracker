"use client";

import { useState, useEffect } from 'react';
import { useNutritionStore } from '../../../store/nutritionStore';
import { useNutritionGoals } from '../hooks/useNutritionGoals';

interface NutritionGoalsFormProps {
  onGoalsSaved?: () => void;
}

export function NutritionGoalsForm({ onGoalsSaved }: NutritionGoalsFormProps) {
  const { showGoalsForm, setShowGoalsForm } = useNutritionStore();
  const { goals, upsertGoals } = useNutritionGoals();

  const [calorieGoal, setCalorieGoal] = useState('');
  const [proteinGoal, setProteinGoal] = useState('');
  const [carbGoal, setCarbGoal] = useState('');
  const [fatGoal, setFatGoal] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (goals) {
      setCalorieGoal(goals.calorie_goal?.toString() || '');
      setProteinGoal(goals.protein_goal?.toString() || '');
      setCarbGoal(goals.carbohydrate_goal?.toString() || '');
      setFatGoal(goals.fat_goal?.toString() || '');
    }
  }, [goals]);

  if (!showGoalsForm) return null;

  const handleSave = async () => {
    setSaving(true);
    await upsertGoals({
      calorie_goal: parseFloat(calorieGoal) || 0,
      protein_goal: parseFloat(proteinGoal) || 0,
      carbohydrate_goal: parseFloat(carbGoal) || 0,
      fat_goal: parseFloat(fatGoal) || 0,
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      setShowGoalsForm(false);
      onGoalsSaved?.();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-[60] bg-neutral-950/95 backdrop-blur-sm flex flex-col animate-fade-in">
      <div className="w-full max-w-md mx-auto flex flex-col h-full animate-slide-up">
        {/* Header */}
        <div className="flex items-center gap-3 p-4 pt-6">
          <button
            onClick={() => setShowGoalsForm(false)}
            className="p-3 text-neutral-400 hover:text-neutral-200 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
          </button>
          <h2 className="text-lg font-semibold text-neutral-100">Nutrition Goals</h2>
        </div>

        <div className="flex-1 overflow-y-auto scroll-touch px-4 pb-safe space-y-4">
          <p className="text-xs text-neutral-500 ml-1">Set your daily nutrition targets to track progress</p>

          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-4 space-y-4 animate-fade-in-up-1 shadow-lg">
            <div className="w-full space-y-4">
              <div>
                <label className="block text-xs font-medium text-indigo-400/80 mb-1 ml-1">Daily Calories</label>
                <input
                  type="number"
                  inputMode="decimal"
                  value={calorieGoal}
                  onChange={(e) => setCalorieGoal(e.target.value)}
                  placeholder="e.g. 2000"
                  className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-2xl text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-emerald-400/80 mb-1 ml-1">Protein (g)</label>
                <input
                  type="number"
                  inputMode="decimal"
                  value={proteinGoal}
                  onChange={(e) => setProteinGoal(e.target.value)}
                  placeholder="e.g. 150"
                  className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-2xl text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-amber-400/80 mb-1 ml-1">Carbohydrates (g)</label>
                <input
                  type="number"
                  inputMode="decimal"
                  value={carbGoal}
                  onChange={(e) => setCarbGoal(e.target.value)}
                  placeholder="e.g. 250"
                  className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-2xl text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-red-400/80 mb-1 ml-1">Fat (g)</label>
                <input
                  type="number"
                  inputMode="decimal"
                  value={fatGoal}
                  onChange={(e) => setFatGoal(e.target.value)}
                  placeholder="e.g. 65"
                  className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-2xl text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-sm"
                />
              </div>
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={saving || saved}
            className={`w-full py-3 rounded-2xl text-sm font-medium transition-all duration-300 shadow-sm backdrop-blur-md border ${saved
                ? 'bg-emerald-500/20 text-emerald-100 border-emerald-500/30'
                : 'bg-indigo-500/20 hover:bg-indigo-500/30 text-white border-indigo-500/30 disabled:opacity-40'
              }`}
          >
            {saved ? '✓ Saved!' : saving ? 'Saving...' : 'Save Goals'}
          </button>
        </div>
      </div>
    </div>
  );
}
