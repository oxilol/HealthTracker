import { NextRequest, NextResponse } from 'next/server';
import { getAuthClient } from '../../../../lib/apiAuth';
import { todayLocalStr, addDays } from '../../../../lib/dateUtils';

export const dynamic = 'force-dynamic';

// GET /api/stats/exercise-maxes?days=N
// Returns all exercise sets (with dates) for the last N days, used to chart per-exercise progression
export async function GET(req: NextRequest) {
  const auth = await getAuthClient(req);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const days = parseInt(req.nextUrl.searchParams.get('days') || '30', 10);
  const locationId = req.nextUrl.searchParams.get('location_id');
  const today = todayLocalStr();
  const isoStart = addDays(today, -days);

  let query = auth.supabase
    .from('workout_sessions')
    .select('id, workout_date')
    .eq('user_id', auth.userId)
    .gte('workout_date', isoStart);

  if (locationId) {
    query = query.eq('location_id', locationId);
  }

  const { data: sessions } = await query;

  if (!sessions || sessions.length === 0) {
    return NextResponse.json({ sets: [] });
  }

  const sessionMap = new Map(sessions.map((s) => [s.id, s.workout_date]));
  const sessionIds = sessions.map((s) => s.id);

  const { data: sets } = await auth.supabase
    .from('exercise_sets')
    .select('session_id, exercise_name, weight')
    .in('session_id', sessionIds)
    .not('weight', 'is', null);

  if (!sets) return NextResponse.json({ sets: [] });

  // Attach the workout_date from the session map into each set row
  const processedSets = sets.map((s) => ({
    ...s,
    date: sessionMap.get(s.session_id) as string,
  }));

  return NextResponse.json({ sets: processedSets });
}
