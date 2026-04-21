import { create } from 'zustand';
import { WorkoutTemplate } from '../types/workout';
import { CardioTemplate } from '../types/cardio';

interface WorkoutUIState {
  // Strength
  showCreateTemplate: boolean;
  editingTemplate: WorkoutTemplate | null;
  showTemplateSettings: boolean;
  setShowCreateTemplate: (show: boolean) => void;
  setEditingTemplate: (template: WorkoutTemplate | null) => void;
  setShowTemplateSettings: (show: boolean) => void;

  // Cardio
  showCreateCardioTemplate: boolean;
  editingCardioTemplate: CardioTemplate | null;
  showCardioSettings: boolean;
  setShowCreateCardioTemplate: (show: boolean) => void;
  setEditingCardioTemplate: (template: CardioTemplate | null) => void;
  setShowCardioSettings: (show: boolean) => void;
}

export const useWorkoutStore = create<WorkoutUIState>((set) => ({
  // Strength
  showCreateTemplate: false,
  editingTemplate: null,
  showTemplateSettings: false,
  setShowCreateTemplate: (show) => set({ showCreateTemplate: show, editingTemplate: null }),
  setEditingTemplate: (template) => set({ editingTemplate: template, showCreateTemplate: !!template }),
  setShowTemplateSettings: (show) => set({ showTemplateSettings: show }),

  // Cardio
  showCreateCardioTemplate: false,
  editingCardioTemplate: null,
  showCardioSettings: false,
  setShowCreateCardioTemplate: (show) => set({ showCreateCardioTemplate: show, editingCardioTemplate: null }),
  setEditingCardioTemplate: (template) => set({ editingCardioTemplate: template, showCreateCardioTemplate: !!template }),
  setShowCardioSettings: (show) => set({ showCardioSettings: show }),
}));
