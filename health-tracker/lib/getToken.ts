import { supabase } from '../services/supabaseClient';

/**
 * Returns the current user's access token from the active Supabase session.
 * Used by client-side hooks to authenticate API route requests via Bearer header.
 */
export async function getToken(): Promise<string | null> {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token || null;
}
