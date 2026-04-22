import { useState } from 'react';
import { useGymLocations } from './useGymLocations';
import { useLocationStore } from '../../../store/locationStore';
import { getToken } from '../../../lib/getToken';

export function useLocationManager() {
  const { locations, loading, createLocation, deleteLocation } = useGymLocations();
  const { currentLocationId, setCurrentLocationId } = useLocationStore();
  const [creating, setCreating] = useState(false);

  const selectLocation = async (id: string | null) => {
    setCurrentLocationId(id);
    try {
      const token = await getToken();
      if (!token) return;
      await fetch('/api/profile', {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ current_location_id: id }),
      });
    } catch {
      // Store is already updated optimistically
    }
  };

  const createAndSelectLocation = async (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return false;
    setCreating(true);
    const loc = await createLocation(trimmed);
    setCreating(false);
    if (loc) {
      await selectLocation(loc.id);
      return true;
    }
    return false;
  };

  const removeLocation = async (id: string) => {
    await deleteLocation(id);
    if (currentLocationId === id) {
      setCurrentLocationId(null);
      try {
        const token = await getToken();
        if (token) {
          await fetch('/api/profile', {
            method: 'PATCH',
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ current_location_id: null }),
          });
        }
      } catch { /* no-op */ }
    }
  };

  return {
    locations,
    loading,
    currentLocationId,
    creating,
    selectLocation,
    createLocation: createAndSelectLocation,
    removeLocation,
  };
}
