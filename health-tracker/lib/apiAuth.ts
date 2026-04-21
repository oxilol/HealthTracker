import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * Builds an authenticated Supabase client from the Bearer token in the request header.
 * Returns null if the token is missing or the user cannot be verified.
 * Used by all API routes to validate the session and scope queries to the correct user.
 */
export async function getAuthClient(req: NextRequest) {
  const token = req.headers.get('authorization')?.split('Bearer ')[1];
  if (!token) return null;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: { persistSession: false, autoRefreshToken: false },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  return { supabase, userId: user.id };
}
