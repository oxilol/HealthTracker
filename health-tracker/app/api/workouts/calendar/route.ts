import { NextRequest, NextResponse } from 'next/server';
import { getAuthClient } from '../../../../lib/apiAuth';
import { getDaysInMonth } from '../../../../lib/dateUtils';

export const dynamic = 'force-dynamic';

// GET /api/workouts/calendar?year=YYYY&month=M&type=gym|cardio
// Returns a session count per day for the given month — used by gym and cardio calendar components
export async function GET(req: NextRequest) {
  const auth = await getAuthClient(req);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const yearStr = req.nextUrl.searchParams.get('year');
  const monthStr = req.nextUrl.searchParams.get('month');
  const type = req.nextUrl.searchParams.get('type') || 'gym';

  if (!yearStr || monthStr == null) {
    return NextResponse.json({ error: 'Missing year or month' }, { status: 400 });
  }

  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10); // 0-indexed
  const monthPadded = String(month + 1).padStart(2, '0');
  const startDate = `${year}-${monthPadded}-01`;
  const lastDay = getDaysInMonth(year, month);
  const endDate = `${year}-${monthPadded}-${String(lastDay).padStart(2, '0')}`;

  const table = type === 'cardio' ? 'cardio_sessions' : 'workout_sessions';
  const dateField = type === 'cardio' ? 'session_date' : 'workout_date';

  const { data, error } = await auth.supabase
    .from(table)
    .select(dateField)
    .eq('user_id', auth.userId)
    .gte(dateField, startDate)
    .lte(dateField, endDate);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const summaryMap: Record<string, { date: string; sessionCount: number }> = {};
  for (const row of data || []) {
    const date = (row as any)[dateField];
    if (!summaryMap[date]) summaryMap[date] = { date, sessionCount: 0 };
    summaryMap[date].sessionCount += 1;
  }

  return NextResponse.json({ summaries: Object.values(summaryMap) });
}
