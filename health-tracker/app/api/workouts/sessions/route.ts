import { NextRequest, NextResponse } from 'next/server';
import { getAuthClient } from '../../../../lib/apiAuth';
import { todayLocalStr } from '../../../../lib/dateUtils';

export const dynamic = 'force-dynamic';

// GET /api/workouts/sessions?date=YYYY-MM-DD
// Returns sessions with template+exercises and their sets, plus previous template sets for progressive overload
export async function GET(req: NextRequest) {
  const auth = await getAuthClient(req);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const date = req.nextUrl.searchParams.get('date') || todayLocalStr();

  const { data, error } = await auth.supabase
    .from('workout_sessions')
    .select(`
      *,
      template:workout_templates(
        *,
        exercises:template_exercises(*)
      )
    `)
    .eq('user_id', auth.userId)
    .eq('workout_date', date)
    .order('created_at', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const sessions = data || [];
  let sets: any[] = [];
  let previousTemplateSets: any[] = [];

  if (sessions.length > 0) {
    const sessionIds = sessions.map((s: any) => s.id);
    const { data: setsData } = await auth.supabase
      .from('exercise_sets')
      .select('*')
      .in('session_id', sessionIds)
      .order('set_number', { ascending: true });
    sets = setsData || [];

    const activeSession = sessions.find((s: any) => !s.is_completed && s.template_id);
    if (activeSession?.template_id) {
      const { data: prevData } = await auth.supabase
        .from('workout_sessions')
        .select('id, workout_date, exercise_sets ( id, exercise_name, set_number, weight, repetitions )')
        .eq('template_id', activeSession.template_id)
        .eq('is_completed', true)
        .neq('id', activeSession.id)
        .order('workout_date', { ascending: false })
        .limit(1)
        .single();

      if (prevData?.exercise_sets) previousTemplateSets = prevData.exercise_sets as any[];
    }
  }

  return NextResponse.json({ sessions, sets, previousTemplateSets });
}

// POST /api/workouts/sessions — starts a new gym session for a given date and template
export async function POST(req: NextRequest) {
  const auth = await getAuthClient(req);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (!body?.template_id || !body?.date) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

  const { data: session, error } = await auth.supabase
    .from('workout_sessions')
    .insert({ user_id: auth.userId, template_id: body.template_id, workout_date: body.date })
    .select(`*, template:workout_templates(*, exercises:template_exercises(*))`)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data: prevData } = await auth.supabase
    .from('workout_sessions')
    .select('id, workout_date, exercise_sets ( id, exercise_name, set_number, weight, repetitions )')
    .eq('template_id', body.template_id)
    .eq('is_completed', true)
    .order('workout_date', { ascending: false })
    .limit(1)
    .single();

  return NextResponse.json({
    session,
    previousTemplateSets: prevData?.exercise_sets || [],
  });
}

// PATCH /api/workouts/sessions?id= — marks a session as completed
export async function PATCH(req: NextRequest) {
  const auth = await getAuthClient(req);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const id = req.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  const { error } = await auth.supabase
    .from('workout_sessions')
    .update({ is_completed: true })
    .eq('id', id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

// DELETE /api/workouts/sessions?id= — deletes a session (exercise_sets cascade)
export async function DELETE(req: NextRequest) {
  const auth = await getAuthClient(req);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const id = req.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  const { error } = await auth.supabase.from('workout_sessions').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
