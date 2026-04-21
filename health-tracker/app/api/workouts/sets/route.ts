import { NextRequest, NextResponse } from 'next/server';
import { getAuthClient } from '../../../../lib/apiAuth';

export const dynamic = 'force-dynamic';

// GET /api/workouts/sets?sessionIds=id1,id2 — returns sets for the given session IDs
export async function GET(req: NextRequest) {
  const auth = await getAuthClient(req);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const ids = req.nextUrl.searchParams.get('sessionIds')?.split(',').filter(Boolean);
  if (!ids?.length) return NextResponse.json({ sets: [] });

  const { data, error } = await auth.supabase
    .from('exercise_sets')
    .select('*')
    .in('session_id', ids)
    .order('set_number', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ sets: data });
}

// POST /api/workouts/sets — adds a new exercise set to a session
export async function POST(req: NextRequest) {
  const auth = await getAuthClient(req);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (!body?.session_id || !body?.exercise_name) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

  const { data, error } = await auth.supabase
    .from('exercise_sets')
    .insert({
      session_id: body.session_id,
      exercise_name: body.exercise_name,
      set_number: body.set_number,
      weight: body.weight ?? null,
      repetitions: body.repetitions ?? null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ set: data });
}

// DELETE /api/workouts/sets?id= — removes a specific exercise set
export async function DELETE(req: NextRequest) {
  const auth = await getAuthClient(req);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const id = req.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  const { error } = await auth.supabase.from('exercise_sets').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
