import { NextRequest, NextResponse } from 'next/server';
import { getAuthClient } from '../../../../../lib/apiAuth';

export const dynamic = 'force-dynamic';

// GET /api/workouts/cardio/templates — returns all cardio templates with sorted activities
export async function GET(req: NextRequest) {
  const auth = await getAuthClient(req);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data, error } = await auth.supabase
    .from('cardio_templates')
    .select('*, activities:cardio_template_activities(*)')
    .eq('user_id', auth.userId)
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const sorted = (data || []).map((t: any) => ({
    ...t,
    activities: (t.activities || []).sort((a: any, b: any) => (a.activity_order || 0) - (b.activity_order || 0)),
  }));

  return NextResponse.json({ templates: sorted });
}

// POST /api/workouts/cardio/templates — creates a new cardio template and its activities
export async function POST(req: NextRequest) {
  const auth = await getAuthClient(req);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (!body?.name) return NextResponse.json({ error: 'Missing name' }, { status: 400 });

  const { data: template, error } = await auth.supabase
    .from('cardio_templates')
    .insert({ user_id: auth.userId, name: body.name })
    .select()
    .single();

  if (error || !template) return NextResponse.json({ error: error?.message }, { status: 500 });

  if (body.activities?.length > 0) {
    const rows = body.activities.map((a: any) => ({
      template_id: template.id,
      activity_name: a.activity_name,
      activity_order: a.activity_order,
    }));
    await auth.supabase.from('cardio_template_activities').insert(rows);
  }

  return NextResponse.json({ template });
}

// PUT /api/workouts/cardio/templates?id= — replaces a cardio template's name and activities
export async function PUT(req: NextRequest) {
  const auth = await getAuthClient(req);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const id = req.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: 'Invalid body' }, { status: 400 });

  const { error } = await auth.supabase.from('cardio_templates').update({ name: body.name }).eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await auth.supabase.from('cardio_template_activities').delete().eq('template_id', id);

  if (body.activities?.length > 0) {
    const rows = body.activities.map((a: any) => ({
      template_id: id,
      activity_name: a.activity_name,
      activity_order: a.activity_order,
    }));
    await auth.supabase.from('cardio_template_activities').insert(rows);
  }

  return NextResponse.json({ success: true });
}

// DELETE /api/workouts/cardio/templates?id= — deletes template
export async function DELETE(req: NextRequest) {
  const auth = await getAuthClient(req);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const id = req.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  await auth.supabase.from('cardio_sessions').update({ template_id: null }).eq('template_id', id);

  const { error } = await auth.supabase.from('cardio_templates').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
