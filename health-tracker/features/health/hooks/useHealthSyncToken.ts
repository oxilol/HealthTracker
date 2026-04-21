import { useState, useCallback } from 'react';
import { supabase } from '../../../services/supabaseClient';

export function useHealthSyncToken() {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getAccessToken = async (): Promise<string | null> => {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token || null;
  };

  const fetchToken = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const accessToken = await getAccessToken();
      if (!accessToken) throw new Error('Not authenticated');

      const res = await fetch('/api/health-sync-token', {
        headers: { 'Authorization': `Bearer ${accessToken}` },
      });

      if (!res.ok) throw new Error('Failed to fetch token');
      const data = await res.json();
      setToken(data.token);
    } catch (err: any) {
      console.error('Error fetching token:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const generateNewToken = async () => {
    setLoading(true);
    setError(null);
    try {
      const accessToken = await getAccessToken();
      if (!accessToken) throw new Error('Not authenticated');

      const res = await fetch('/api/health-sync-token', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${accessToken}` },
      });

      if (!res.ok) throw new Error('Failed to generate token');
      const data = await res.json();
      setToken(data.token);
    } catch (err: any) {
      console.error('Error generating token:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { token, loading, error, fetchToken, generateNewToken };
}

