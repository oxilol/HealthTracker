import { create } from 'zustand';

interface LocationStore {
  currentLocationId: string | null;
  setCurrentLocationId: (id: string | null) => void;
}

/**
 * Global store for the user's active gym location.
 * Initialized at app mount from the profile API, updated when the user switches locations.
 */
export const useLocationStore = create<LocationStore>((set) => ({
  currentLocationId: null,
  setCurrentLocationId: (id) => set({ currentLocationId: id }),
}));
