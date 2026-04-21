import { NextRequest, NextResponse } from 'next/server';
import { getAuthClient } from '../../../../lib/apiAuth';
import { todayLocalStr } from '../../../../lib/dateUtils';

export const dynamic = 'force-dynamic';

// GET /api/nutrition/logs?date=YYYY-MM-DD — returns all food logs with joined food and meal details for a date
export async function GET(req: NextRequest) {
  const auth = await getAuthClient(req);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const date = req.nextUrl.searchParams.get('date') || todayLocalStr();

  const { data, error } = await auth.supabase
    .from('nutrition_logs')
    .select(`
      *,
      food:foods(*),
      meal:meals(*)
    `)
    .eq('user_id', auth.userId)
    .eq('log_date', date)
    .order('created_at', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ logs: data });
}

// POST /api/nutrition/logs — inserts a new food log entry for the user
export async function POST(req: NextRequest) {
  const auth = await getAuthClient(req);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: 'Invalid body' }, { status: 400 });

  const { data, error } = await auth.supabase
    .from('nutrition_logs')
    .insert({ ...body, user_id: auth.userId })
    .select(`
      *,
      food:foods(*),
      meal:meals(*)
    `)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ log: data });
}

// DELETE /api/nutrition/logs?id= — removes a specific food log entry
export async function DELETE(req: NextRequest) {
  const auth = await getAuthClient(req);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const id = req.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  const { error } = await auth.supabase.from('nutrition_logs').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
