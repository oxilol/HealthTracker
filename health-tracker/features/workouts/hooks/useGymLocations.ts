import { useState, useEffect, useCallback } from 'react';
import { GymLocation } from '../../../types/gymLocation';
import { getToken } from '../../../lib/getToken';

export function useGymLocations() {
  const [locations, setLocations] = useState<GymLocation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLocations = useCallback(async () => {
    try {
      const token = await getToken();
      if (!token) return;
      const res = await fetch('/api/gym-locations', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      setLocations(data.locations || []);
    } catch {

    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLocations();
  }, [fetchLocations]);

  const createLocation = useCallback(async (name: string): Promise<GymLocation | null> => {
    try {
      const token = await getToken();
      if (!token) return null;
      const res = await fetch('/api/gym-locations', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) return null;
      const data = await res.json();
      setLocations((prev) => [...prev, data.location]);
      return data.location;
    } catch {
      return null;
    }
  }, []);

  const deleteLocation = useCallback(async (id: string) => {
    try {
      const token = await getToken();
      if (!token) return;
      await fetch(`/api/gym-locations?id=${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      setLocations((prev) => prev.filter((l) => l.id !== id));
    } catch {

    }
  }, []);

  return { locations, loading, createLocation, deleteLocation, refetch: fetchLocations };
}
