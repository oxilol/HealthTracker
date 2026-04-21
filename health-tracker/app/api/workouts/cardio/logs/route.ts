import { NextRequest, NextResponse } from 'next/server';
import { getAuthClient } from '../../../../../lib/apiAuth';

export const dynamic = 'force-dynamic';

// POST /api/workouts/cardio/logs — adds an activity log to a cardio session
export async function POST(req: NextRequest) {
  const auth = await getAuthClient(req);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (!body?.session_id || !body?.activity_name) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

  const { data, error } = await auth.supabase
    .from('cardio_logs')
    .insert({
      session_id: body.session_id,
      activity_name: body.activity_name,
      log_number: body.log_number,
      duration_minutes: body.duration_minutes ?? null,
      distance_km: body.distance_km ?? null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ log: data });
}

// DELETE /api/workouts/cardio/logs?id= — removes a specific cardio log entry
export async function DELETE(req: NextRequest) {
  const auth = await getAuthClient(req);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const id = req.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  const { error } = await auth.supabase.from('cardio_logs').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
