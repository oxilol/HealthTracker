import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'blabla_key_for_build';

// Admin client bypasses Row Level Security (RLS).
// Never use on the client side.
export const supabaseAdmin = createClient(supabaseUrl || 'https://blabla.supabase.co', supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});
