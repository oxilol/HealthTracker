import { create } from 'zustand';
import { Food, Meal } from '../types/nutrition';

interface NutritionUIState {
  showFoodSearch: boolean;
  showCreateFood: boolean;
  showCreateMeal: boolean;
  showGoalsForm: boolean;
  editingFood: Food | null;
  editingMeal: Meal | null;
  setShowFoodSearch: (show: boolean) => void;
  setShowCreateFood: (show: boolean) => void;
  setShowCreateMeal: (show: boolean) => void;
  setShowGoalsForm: (show: boolean) => void;
  setEditingFood: (food: Food | null) => void;
  setEditingMeal: (meal: Meal | null) => void;
}

export const useNutritionStore = create<NutritionUIState>((set) => ({
  showFoodSearch: false,
  showCreateFood: false,
  showCreateMeal: false,
  showGoalsForm: false,
  editingFood: null,
  editingMeal: null,
  setShowFoodSearch: (show) => set({ showFoodSearch: show }),
  setShowCreateFood: (show) => set({ showCreateFood: show, editingFood: show ? null : null }),
  setShowCreateMeal: (show) => set({ showCreateMeal: show, editingMeal: show ? null : null }),
  setShowGoalsForm: (show) => set({ showGoalsForm: show }),
  setEditingFood: (food) => set({ editingFood: food, showCreateFood: !!food }),
  setEditingMeal: (meal) => set({ editingMeal: meal, showCreateMeal: !!meal }),
}));
