import { NextRequest, NextResponse } from 'next/server';
import { getAuthClient } from '../../../../lib/apiAuth';

export const dynamic = 'force-dynamic';

// GET /api/health/weight?date=YYYY-MM-DD
// Returns the weight for the requested date and the most recently logged weight entry
export async function GET(req: NextRequest) {
  const auth = await getAuthClient(req);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const date = req.nextUrl.searchParams.get('date');
  if (!date) return NextResponse.json({ error: 'Missing date param' }, { status: 400 });

  const [dateWeight, latestWeight] = await Promise.all([
    auth.supabase
      .from('weight_logs')
      .select('*')
      .eq('user_id', auth.userId)
      .eq('date', date)
      .maybeSingle(),
    auth.supabase
      .from('weight_logs')
      .select('*')
      .eq('user_id', auth.userId)
      .order('date', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  return NextResponse.json({
    weight: dateWeight.data,
    lastLoggedWeight: latestWeight.data,
  });
}

// POST /api/health/weight
// Body: { date: string, weight: number }
// Upserts a weight log for the user — one entry per day
export async function POST(req: NextRequest) {
  const auth = await getAuthClient(req);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (!body?.date || body?.weight == null) {
    return NextResponse.json({ error: 'Missing date or weight' }, { status: 400 });
  }

  const { data, error } = await auth.supabase
    .from('weight_logs')
    .upsert(
      { user_id: auth.userId, date: body.date, weight: body.weight },
      { onConflict: 'user_id,date' }
    )
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ weight: data });
}
