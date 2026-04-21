import { useState, useEffect } from 'react';
import { supabase } from '../../../services/supabaseClient';

/**
 * Hook to load the set of dates that have health_metrics records for a given month.
 * Calls /api/health/calendar.
 */
export function useHealthCalendarActiveDates(userId: string | undefined, currentDate: Date) {
    const [activeDates, setActiveDates] = useState<Set<string>>(new Set());
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        async function fetchActiveDates() {
            if (!userId) return;

            setIsLoading(true);
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (!session) return;

                const year = currentDate.getFullYear();
                const month = currentDate.getMonth();

                const res = await fetch(`/api/health/calendar?year=${year}&month=${month}`, {
                    headers: { Authorization: `Bearer ${session.access_token}` },
                });

                if (!res.ok) throw new Error(`Request failed: ${res.status}`);
                const json = await res.json();
                setActiveDates(new Set<string>(json.activeDates));
            } catch (err) {
                console.error('Error fetching calendar dates:', err);
            } finally {
                setIsLoading(false);
            }
        }

        fetchActiveDates();
    }, [currentDate, userId]);

    return { activeDates, isLoading };
}