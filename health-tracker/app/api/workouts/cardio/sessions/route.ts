import { NextRequest, NextResponse } from 'next/server';
import { getAuthClient } from '../../../../../lib/apiAuth';
import { todayLocalStr } from '../../../../../lib/dateUtils';

export const dynamic = 'force-dynamic';

// GET /api/workouts/cardio/sessions?date=YYYY-MM-DD
// Returns cardio sessions with template+activities and their logs for the given date
export async function GET(req: NextRequest) {
  const auth = await getAuthClient(req);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const date = req.nextUrl.searchParams.get('date') || todayLocalStr();

  const { data, error } = await auth.supabase
    .from('cardio_sessions')
    .select(`
      *,
      template:cardio_templates(
        *,
        activities:cardio_template_activities(*)
      )
    `)
    .eq('user_id', auth.userId)
    .eq('session_date', date)
    .order('created_at', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const sessions = data || [];
  let logs: any[] = [];

  if (sessions.length > 0) {
    const sessionIds = sessions.map((s: any) => s.id);
    const { data: logsData } = await auth.supabase
      .from('cardio_logs')
      .select('*')
      .in('session_id', sessionIds)
      .order('log_number', { ascending: true });
    logs = logsData || [];
  }

  return NextResponse.json({ sessions, logs });
}

// POST /api/workouts/cardio/sessions — starts a new cardio session
export async function POST(req: NextRequest) {
  const auth = await getAuthClient(req);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (!body?.template_id || !body?.date) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

  const { data, error } = await auth.supabase
    .from('cardio_sessions')
    .insert({ user_id: auth.userId, template_id: body.template_id, session_date: body.date })
    .select(`*, template:cardio_templates(*, activities:cardio_template_activities(*))`)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ session: data });
}

// PATCH /api/workouts/cardio/sessions?id= — marks session as completed
export async function PATCH(req: NextRequest) {
  const auth = await getAuthClient(req);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const id = req.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  const { error } = await auth.supabase.from('cardio_sessions').update({ is_completed: true }).eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

// DELETE /api/workouts/cardio/sessions?id= — deletes a cardio session
export async function DELETE(req: NextRequest) {
  const auth = await getAuthClient(req);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const id = req.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  const { error } = await auth.supabase.from('cardio_sessions').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
