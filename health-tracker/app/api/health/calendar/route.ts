import { NextRequest, NextResponse } from 'next/server';
import { getDaysInMonth } from '../../../../lib/dateUtils';
import { getAuthClient } from '../../../../lib/apiAuth';

export const dynamic = 'force-dynamic';

// GET /api/health/calendar?year=YYYY&month=
// Returns the list of dates that have health_metrics records in the given month
export async function GET(req: NextRequest) {
  const auth = await getAuthClient(req);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const yearStr = req.nextUrl.searchParams.get('year');
  const monthStr = req.nextUrl.searchParams.get('month');

  if (!yearStr || monthStr == null) {
    return NextResponse.json({ error: 'Missing year or month params' }, { status: 400 });
  }

  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);

  const monthPadded = String(month + 1).padStart(2, '0');
  const startOfMonth = `${year}-${monthPadded}-01`;
  const daysCount = getDaysInMonth(year, month);
  const endOfMonth = `${year}-${monthPadded}-${String(daysCount).padStart(2, '0')}`;

  const { data, error } = await auth.supabase
    .from('health_metrics')
    .select('date')
    .eq('user_id', auth.userId)
    .gte('date', startOfMonth)
    .lte('date', endOfMonth);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const activeDates = (data || []).map((row: { date: string }) => row.date);
  return NextResponse.json({ activeDates });
}
