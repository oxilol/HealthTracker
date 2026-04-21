import { useState, useEffect } from 'react';
import { supabase } from '../../../services/supabaseClient';
import { HealthMetrics } from '../../../types/health';
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

/**
 * Hook to fetch a selected day's health metrics via the API.
 */
export function useHealthData(dateStr: string) {
  const [metrics, setMetrics] = useState<HealthMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      if (!dateStr) return;

      setLoading(true);
      setError(null);

      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error('Not authenticated');

        const res = await fetch(`/api/health/metrics?date=${dateStr}`, {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });

        if (!res.ok) throw new Error(`Request failed: ${res.status}`);
        const json = await res.json();
        setMetrics(json.metrics);
      } catch (err: any) {
        console.error('Error fetching health data:', err);
        setError(err.message || 'Failed to fetch health data');
      } finally {
        setLoading(false);
      }
    }

    fetchData();

    // Subscribe to realtime changes so the dashboard updates live if a sync happens while the app is open
    const metricsSubscription = supabase
      .channel('health_metrics_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'health_metrics' },
        (payload: RealtimePostgresChangesPayload<{ [key: string]: any }>) => {
          if (payload.new && (payload.new as HealthMetrics).date === dateStr) {
            setMetrics(payload.new as HealthMetrics);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(metricsSubscription);
    };
  }, [dateStr]);

  return { metrics, loading, error };
}
