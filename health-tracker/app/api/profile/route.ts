import { NextRequest, NextResponse } from 'next/server';
import { getAuthClient } from '../../../lib/apiAuth';

export const dynamic = 'force-dynamic';

// GET: Returns the user's profile preferences (only step_goal for now)
export async function GET(req: NextRequest) {
  const auth = await getAuthClient(req);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data, error } = await auth.supabase
    .from('profiles')
    .select('step_goal')
    .eq('id', auth.userId)
    .maybeSingle();

  if (error) return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });

  return NextResponse.json({ step_goal: data?.step_goal ?? 10000 });
}

// PATCH: Updates user profile preferences
export async function PATCH(req: NextRequest) {
  const auth = await getAuthClient(req);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });

  const updates: Record<string, number> = {};
  if (typeof body.step_goal === 'number' && body.step_goal > 0) {
    updates.step_goal = body.step_goal;
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
  }

  const { error } = await auth.supabase
    .from('profiles')
    .upsert({ id: auth.userId, ...updates }, { onConflict: 'id' });

  if (error) return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });

  return NextResponse.json({ success: true, ...updates });
}
