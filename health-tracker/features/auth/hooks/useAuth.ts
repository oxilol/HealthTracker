import { useEffect } from 'react';
import { supabase } from '../../../services/supabaseClient';
import { useUserStore } from '../../../store/userStore';

/**
 * Global authentication hook
 */
export const useAuth = () => {
  const { setUser, setLoading, user, isLoading } = useUserStore();

  useEffect(() => {
    let mounted = true;

    async function getSession() {
      try {
        setLoading(true);
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error("Error checking session:", error.message);
          return;
        }

        if (mounted && session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email,
            created_at: session.user.created_at,
          });
        } else if (mounted) {
          setUser(null);
        }
      } catch (e) {
        console.error("Unexpected error getting session:", e);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email,
            created_at: session.user.created_at,
          });
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [setUser, setLoading]);

  return { user, isLoading };
};
