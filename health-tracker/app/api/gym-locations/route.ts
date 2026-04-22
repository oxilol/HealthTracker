import { NextRequest, NextResponse } from 'next/server';
import { getAuthClient } from '../../../lib/apiAuth';

export const dynamic = 'force-dynamic';

// GET /api/gym-locations — returns all gym locations for the user
export async function GET(req: NextRequest) {
  const auth = await getAuthClient(req);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data, error } = await auth.supabase
    .from('gym_locations')
    .select('*')
    .eq('user_id', auth.userId)
    .order('created_at', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ locations: data || [] });
}

// POST /api/gym-locations — creates a new gym location
export async function POST(req: NextRequest) {
  const auth = await getAuthClient(req);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (!body?.name?.trim()) return NextResponse.json({ error: 'Missing name' }, { status: 400 });

  const { data, error } = await auth.supabase
    .from('gym_locations')
    .insert({ user_id: auth.userId, name: body.name.trim() })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ location: data });
}

// DELETE /api/gym-locations?id= — deletes a gym location
export async function DELETE(req: NextRequest) {
  const auth = await getAuthClient(req);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const id = req.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  const { error } = await auth.supabase
    .from('gym_locations')
    .delete()
    .eq('id', id)
    .eq('user_id', auth.userId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
