import { NextRequest, NextResponse } from 'next/server';
import { getAuthClient } from '../../../../lib/apiAuth';

export const dynamic = 'force-dynamic';

// GET /api/nutrition/goals — fetches the user's current macro/calorie goals
export async function GET(req: NextRequest) {
  const auth = await getAuthClient(req);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data, error } = await auth.supabase
    .from('nutrition_goals')
    .select('*')
    .eq('user_id', auth.userId)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ goals: data });
}

// POST /api/nutrition/goals — upserts the user's nutrition goals (creates or updates)
export async function POST(req: NextRequest) {
  const auth = await getAuthClient(req);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: 'Invalid body' }, { status: 400 });

  const payload = {
    user_id: auth.userId,
    calorie_goal: body.calorie_goal ?? 0,
    protein_goal: body.protein_goal ?? 0,
    carbohydrate_goal: body.carbohydrate_goal ?? 0,
    fat_goal: body.fat_goal ?? 0,
  };

  // Upsert based on user_id so we never create duplicates
  const { data, error } = await auth.supabase
    .from('nutrition_goals')
    .upsert(payload, { onConflict: 'user_id' })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ goals: data });
}
