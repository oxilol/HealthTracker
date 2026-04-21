import { NextRequest, NextResponse } from 'next/server';
import { getAuthClient } from '../../../../lib/apiAuth';

export const dynamic = 'force-dynamic';

// GET /api/health/metrics?date=YYYY-MM-DD
// Returns the health_metrics row for the authenticated user on the requested date
export async function GET(req: NextRequest) {
  const auth = await getAuthClient(req);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const date = req.nextUrl.searchParams.get('date');
  if (!date) return NextResponse.json({ error: 'Missing date param' }, { status: 400 });

  const { data, error } = await auth.supabase
    .from('health_metrics')
    .select('*')
    .eq('user_id', auth.userId)
    .eq('date', date)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ metrics: data });
}
