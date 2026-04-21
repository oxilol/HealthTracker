import { NextRequest, NextResponse } from 'next/server';
import { getAuthClient } from '../../../../lib/apiAuth';

export const dynamic = 'force-dynamic';

// GET /api/workouts/templates — returns all gym templates with their exercises, sorted by order
export async function GET(req: NextRequest) {
  const auth = await getAuthClient(req);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data, error } = await auth.supabase
    .from('workout_templates')
    .select('*, exercises:template_exercises(*)')
    .eq('user_id', auth.userId)
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const sorted = (data || []).map((t: any) => ({
    ...t,
    exercises: (t.exercises || []).sort((a: any, b: any) => (a.exercise_order || 0) - (b.exercise_order || 0)),
  }));

  return NextResponse.json({ templates: sorted });
}

// POST /api/workouts/templates — creates a new template and its exercises
export async function POST(req: NextRequest) {
  const auth = await getAuthClient(req);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (!body?.name) return NextResponse.json({ error: 'Missing name' }, { status: 400 });

  const { data: template, error } = await auth.supabase
    .from('workout_templates')
    .insert({ user_id: auth.userId, name: body.name })
    .select()
    .single();

  if (error || !template) return NextResponse.json({ error: error?.message }, { status: 500 });

  if (body.exercises?.length > 0) {
    const rows = body.exercises.map((e: any) => ({
      template_id: template.id,
      exercise_name: e.exercise_name,
      exercise_order: e.exercise_order,
    }));
    await auth.supabase.from('template_exercises').insert(rows);
  }

  return NextResponse.json({ template });
}

// PUT /api/workouts/templates?id= — replaces a template's name and exercises
export async function PUT(req: NextRequest) {
  const auth = await getAuthClient(req);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const id = req.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: 'Invalid body' }, { status: 400 });

  const { error } = await auth.supabase.from('workout_templates').update({ name: body.name }).eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await auth.supabase.from('template_exercises').delete().eq('template_id', id);

  if (body.exercises?.length > 0) {
    const rows = body.exercises.map((e: any) => ({
      template_id: id,
      exercise_name: e.exercise_name,
      exercise_order: e.exercise_order,
    }));
    await auth.supabase.from('template_exercises').insert(rows);
  }

  return NextResponse.json({ success: true });
}

// DELETE /api/workouts/templates?id= — deletes a template (nullifies sessions referencing it)
export async function DELETE(req: NextRequest) {
  const auth = await getAuthClient(req);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const id = req.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  // Nullify template_id in sessions before deleting to avoid FK conflict
  await auth.supabase.from('workout_sessions').update({ template_id: null }).eq('template_id', id);

  const { error } = await auth.supabase.from('workout_templates').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
