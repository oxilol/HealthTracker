import { create } from 'zustand';

interface HealthStore {
  showSettingsModal: boolean;
  setShowSettingsModal: (show: boolean) => void;
}

export const useHealthStore = create<HealthStore>((set) => ({
  showSettingsModal: false,
  setShowSettingsModal: (show) => set({ showSettingsModal: show }),
}));
