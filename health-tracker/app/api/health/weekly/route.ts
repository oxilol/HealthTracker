import { NextRequest, NextResponse } from 'next/server';
import { addDays } from '../../../../lib/dateUtils';
import { getAuthClient } from '../../../../lib/apiAuth';

export const dynamic = 'force-dynamic';

// GET /api/health/weekly?weekSat=YYYY-MM-DD
// Returns a 7-day summary (health metrics + nutrition totals + workout flag) for the Saturday to Friday week
export async function GET(req: NextRequest) {
  const auth = await getAuthClient(req);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const weekSat = req.nextUrl.searchParams.get('weekSat');
  if (!weekSat) return NextResponse.json({ error: 'Missing weekSat param' }, { status: 400 });

  // Build the 7-date range for the week (Sat through Fri)
  const dates = Array.from({ length: 7 }, (_, i) => addDays(weekSat, i));
  const startDate = dates[0];
  const endDate = dates[dates.length - 1];

  const [metricsRes, nutritionRes, workoutRes] = await Promise.all([
    auth.supabase
      .from('health_metrics')
      .select('*')
      .eq('user_id', auth.userId)
      .gte('date', startDate)
      .lte('date', endDate),
    auth.supabase
      .from('nutrition_logs')
      .select('log_date, calories, protein')
      .eq('user_id', auth.userId)
      .gte('log_date', startDate)
      .lte('log_date', endDate),
    auth.supabase
      .from('workout_sessions')
      .select('workout_date')
      .eq('user_id', auth.userId)
      .gte('workout_date', startDate)
      .lte('workout_date', endDate),
  ]);

  // Aggregate into a per-day map
  const map = new Map(
    dates.map((d) => [d, { date: d, metrics: null as any, calories: 0, protein: 0, hasWorkout: false }])
  );

  for (const row of metricsRes.data || []) {
    const day = map.get(row.date);
    if (day) day.metrics = row;
  }

  for (const row of nutritionRes.data || []) {
    const day = map.get(row.log_date);
    if (day) {
      day.calories += row.calories || 0;
      day.protein += row.protein || 0;
    }
  }

  for (const row of workoutRes.data || []) {
    const day = map.get(row.workout_date);
    if (day) day.hasWorkout = true;
  }

  return NextResponse.json({ days: dates.map((d) => map.get(d)) });
}
