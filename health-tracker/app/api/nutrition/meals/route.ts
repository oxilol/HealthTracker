import { NextRequest, NextResponse } from 'next/server';
import { getAuthClient } from '../../../../lib/apiAuth';
import { todayLocalStr } from '../../../../lib/dateUtils';

export const dynamic = 'force-dynamic';

// GET /api/nutrition/meals — fetches all active (non-expired) meals with their food details
export async function GET(req: NextRequest) {
  const auth = await getAuthClient(req);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const today = todayLocalStr();

  const { data, error } = await auth.supabase
    .from('meals')
    .select(`
      *,
      foods:meal_foods(
        *,
        food:foods(*)
      )
    `)
    .eq('user_id', auth.userId)
    .or(`expiration_date.is.null,expiration_date.gte.${today}`)
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ meals: data });
}

// POST /api/nutrition/meals — creates a new meal and inserts its associated meal_foods
export async function POST(req: NextRequest) {
  const auth = await getAuthClient(req);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (!body?.name) return NextResponse.json({ error: 'Missing name' }, { status: 400 });

  const { data: meal, error: mealError } = await auth.supabase
    .from('meals')
    .insert({ user_id: auth.userId, name: body.name, expiration_date: body.expiration_date || null })
    .select()
    .single();

  if (mealError || !meal) return NextResponse.json({ error: mealError?.message }, { status: 500 });

  if (body.meal_foods?.length > 0) {
    const entries = body.meal_foods.map((mf: any) => ({
      meal_id: meal.id,
      food_id: mf.food_id,
      quantity: mf.quantity,
      unit: mf.unit,
    }));
    await auth.supabase.from('meal_foods').insert(entries);
  }

  return NextResponse.json({ meal });
}

// PUT /api/nutrition/meals?id= — updates a meal name/expiry and replaces its meal_foods
export async function PUT(req: NextRequest) {
  const auth = await getAuthClient(req);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const id = req.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: 'Invalid body' }, { status: 400 });

  const { error: mealError } = await auth.supabase
    .from('meals')
    .update({ name: body.name, expiration_date: body.expiration_date || null })
    .eq('id', id);

  if (mealError) return NextResponse.json({ error: mealError.message }, { status: 500 });

  // Replace meal foods: delete existing, then re-insert
  await auth.supabase.from('meal_foods').delete().eq('meal_id', id);

  if (body.meal_foods?.length > 0) {
    const entries = body.meal_foods.map((mf: any) => ({
      meal_id: id,
      food_id: mf.food_id,
      quantity: mf.quantity,
      unit: mf.unit,
    }));
    await auth.supabase.from('meal_foods').insert(entries);
  }

  return NextResponse.json({ success: true });
}

// DELETE /api/nutrition/meals?id= — removes a meal and cleans up related FK references
export async function DELETE(req: NextRequest) {
  const auth = await getAuthClient(req);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const id = req.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  await Promise.all([
    auth.supabase.from('nutrition_logs').update({ meal_id: null }).eq('meal_id', id),
    auth.supabase.from('meal_foods').delete().eq('meal_id', id),
  ]);

  const { error } = await auth.supabase.from('meals').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
