import { NextRequest, NextResponse } from 'next/server';
import { getAuthClient } from '../../../../lib/apiAuth';
import { todayLocalStr, addDays } from '../../../../lib/dateUtils';

export const dynamic = 'force-dynamic';

// GET /api/stats/daily?days=N
// Returns an array of DailyStats spanning the last N days, aggregated across all health domains
export async function GET(req: NextRequest) {
  const auth = await getAuthClient(req);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const days = parseInt(req.nextUrl.searchParams.get('days') || '30', 10);
  const today = todayLocalStr();
  const startStr = addDays(today, -days);

  const [nutrition, measurements, health, workouts, cardio, prevWeight] = await Promise.all([
    auth.supabase
      .from('nutrition_logs')
      .select('log_date, calories, protein, carbohydrates, fat')
      .eq('user_id', auth.userId)
      .gte('log_date', startStr),
    auth.supabase
      .from('weight_logs')
      .select('*')
      .eq('user_id', auth.userId)
      .gte('date', startStr),
    auth.supabase
      .from('health_metrics')
      .select('*')
      .eq('user_id', auth.userId)
      .gte('date', startStr),
    auth.supabase
      .from('workout_sessions')
      .select('workout_date')
      .eq('user_id', auth.userId)
      .gte('workout_date', startStr),
    auth.supabase
      .from('cardio_sessions')
      .select('session_date')
      .eq('user_id', auth.userId)
      .gte('session_date', startStr),
    auth.supabase
      .from('weight_logs')
      .select('weight')
      .eq('user_id', auth.userId)
      .lt('date', startStr)
      .order('date', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  let lastKnownWeight: number | null = prevWeight.data?.weight || null;

  // Build one entry per day from oldest to today
  const stats = [];
  for (let i = days - 1; i >= 0; i--) {
    const dateStr = addDays(today, -i);

    const nData = nutrition.data?.filter((n) => n.log_date === dateStr) || [];
    const totalCal = nData.reduce((acc, curr) => acc + (curr.calories || 0), 0);
    const totalPro = nData.reduce((acc, curr) => acc + (curr.protein || 0), 0);
    const totalCar = nData.reduce((acc, curr) => acc + (curr.carbohydrates || 0), 0);
    const totalFat = nData.reduce((acc, curr) => acc + (curr.fat || 0), 0);

    const mData = measurements.data?.find((m) => m.date === dateStr);
    if (mData?.weight) lastKnownWeight = mData.weight;

    const hData = health.data?.find((h) => h.date === dateStr);
    const hasW = workouts.data?.some((w) => typeof w.workout_date === 'string' && w.workout_date.startsWith(dateStr));
    const hasC = cardio.data?.some((c) => typeof c.session_date === 'string' && c.session_date.startsWith(dateStr));

    stats.push({
      date: dateStr,
      calories: totalCal,
      protein: totalPro,
      carbs: totalCar,
      fat: totalFat,
      weight: lastKnownWeight,
      steps: hData?.steps || 0,
      activeEnergy: hData?.active_energy || 0,
      hasWorkout: !!hasW,
      hasCardio: !!hasC,
    });
  }

  return NextResponse.json({ stats });
}
