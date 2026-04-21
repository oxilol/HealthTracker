import { NextRequest, NextResponse } from 'next/server';
import { getAuthClient } from '../../../../lib/apiAuth';
import { getDaysInMonth } from '../../../../lib/dateUtils';

export const dynamic = 'force-dynamic';

// GET /api/nutrition/calendar?year=YYYY&month=
// Returns daily nutrition totals for the month, used by the nutrition calendar
export async function GET(req: NextRequest) {
  const auth = await getAuthClient(req);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const yearStr = req.nextUrl.searchParams.get('year');
  const monthStr = req.nextUrl.searchParams.get('month');

  if (!yearStr || monthStr == null) {
    return NextResponse.json({ error: 'Missing year or month params' }, { status: 400 });
  }

  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10); // 0-indexed

  const monthPadded = String(month + 1).padStart(2, '0');
  const startDate = `${year}-${monthPadded}-01`;
  const lastDay = getDaysInMonth(year, month);
  const endDate = `${year}-${monthPadded}-${String(lastDay).padStart(2, '0')}`;

  const { data, error } = await auth.supabase
    .from('nutrition_logs')
    .select('log_date, calories, protein, carbohydrates, fat')
    .eq('user_id', auth.userId)
    .gte('log_date', startDate)
    .lte('log_date', endDate);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const summaryMap: Record<string, { date: string; calories: number; protein: number; carbohydrates: number; fat: number }> = {};

  for (const log of data || []) {
    if (!summaryMap[log.log_date]) {
      summaryMap[log.log_date] = { date: log.log_date, calories: 0, protein: 0, carbohydrates: 0, fat: 0 };
    }
    summaryMap[log.log_date].calories += log.calories || 0;
    summaryMap[log.log_date].protein += log.protein || 0;
    summaryMap[log.log_date].carbohydrates += log.carbohydrates || 0;
    summaryMap[log.log_date].fat += log.fat || 0;
  }

  return NextResponse.json({ summaries: Object.values(summaryMap) });
}
