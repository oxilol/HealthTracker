import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

async function getAuthClient(req: NextRequest) {
  const token = req.headers.get('authorization')?.split('Bearer ')[1];
  if (!token) return null;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  
  const supabase = createClient(supabaseUrl, supabaseKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false }
  });
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  
  return { supabase, userId: user.id };
}

// GET: Retrieves the user's current health sync token
export async function GET(req: NextRequest) {
  const auth = await getAuthClient(req);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data, error } = await auth.supabase
    .from('profiles')
    .select('health_sync_token')
    .eq('id', auth.userId)
    .maybeSingle();

  if (error) return NextResponse.json({ error: 'Failed' }, { status: 500 });
  return NextResponse.json({ token: data?.health_sync_token || null });
}

// POST: Generates and saves a new random health sync token for the user
export async function POST(req: NextRequest) {
  const auth = await getAuthClient(req);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const newToken = crypto.randomUUID();
  const { error } = await auth.supabase
    .from('profiles')
    .upsert({ id: auth.userId, health_sync_token: newToken }, { onConflict: 'id' });

  if (error) return NextResponse.json({ error: 'Failed' }, { status: 500 });
  return NextResponse.json({ token: newToken });
}
