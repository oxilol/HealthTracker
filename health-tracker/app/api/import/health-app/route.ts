import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../../services/supabaseAdmin';
import { validateSyncToken } from '../../utils/auth';

export const dynamic = 'force-dynamic';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-api-key',
};

// OPTIONS: Handles CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

// GET: Verifies routing path for the app
export async function GET() {
  return NextResponse.json({ status: 'ok', route: '/api/import/health-app' }, { headers: corsHeaders });
}

// POST: Processes and routes incoming health data payloads
export async function POST(req: NextRequest) {
  try {
    const { userId, error, status } = await validateSyncToken(req);
    if (error) return NextResponse.json({ error }, { status, headers: corsHeaders });

    const body = await req.json().catch(() => null);
    if (!body) return NextResponse.json({ error: 'Invalid JSON' }, { status: 400, headers: corsHeaders });

    // if ('date_range' in body || body.metrics?.[0]?.data_points) {
    //   return await handleAppleHealthExport(body, userId!);
    // }

    return await handleHealthSyncApp(body, userId!);
  } catch (err) {
    console.error('HealthSync API Error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500, headers: corsHeaders });
  }
}

// Helper to aggregate distant/step metrics from an Apple Health Export payload
// *** Currently not used ***
/*
async function handleAppleHealthExport(body: any, userId: string) {
  const aggregated: Record<string, { distance_km: number; flights_climbed: number }> = {};

  for (const metric of (body.metrics || [])) {
    for (const dp of (metric.data_points || [])) {
      if (dp.value == null || !dp.unit) continue;

      const dateStr = (dp.timestamp || dp.start_date || dp.end_date)?.substring(0, 10);
      if (!dateStr) continue;

      aggregated[dateStr] ??= { distance_km: 0, flights_climbed: 0 };

      const unit = dp.unit.toLowerCase();
      const cat = (metric.category || '').toLowerCase();

      if (unit === 'km' || unit === 'm' || cat.includes('distance')) {
        aggregated[dateStr].distance_km += dp.value / 1000;
      } else if (unit === 'count' || unit === 'floors' || unit === 'flights' || cat.includes('flight') || cat.includes('stair')) {
        aggregated[dateStr].flights_climbed += dp.value;
      }
    }
  }

  let imported = 0;
  for (const [date, agg] of Object.entries(aggregated)) {
    if (!agg.distance_km && !agg.flights_climbed) continue;

    const { data: existing } = await supabaseAdmin.from('health_metrics').select('*').eq('user_id', userId).eq('date', date).single();
    await supabaseAdmin.from('health_metrics').upsert({ user_id: userId, date, ...existing, ...agg }, { onConflict: 'user_id,date' });
    imported++;
  }

  return NextResponse.json({ imported: { health_metrics_dates: imported } }, { headers: corsHeaders });
}
*/

// Helper to upsert sleep, steps, and workouts arrays from the HealthSync app
async function handleHealthSyncApp(body: any, userId: string) {
  const res = { sleep: 0, metrics: 0, workouts: 0 };

  //sleep
  //TODO: Implement sleep tracking

  //metrics
  for (const metricItem of (body.metrics || [])) {
    const { data: existing } = await supabaseAdmin.from('health_metrics').select('*').eq('user_id', userId).eq('date', metricItem.date).single();

    const payload: any = { user_id: userId, date: metricItem.date, steps: metricItem.steps, active_energy: metricItem.activeEnergy };
    if (existing) {
      payload.distance_km = existing.distance_km;
      payload.flights_climbed = existing.flights_climbed;
    }

    const { error } = await supabaseAdmin.from('health_metrics').upsert(payload, { onConflict: 'user_id,date' });
    if (!error) res.metrics++;
  }

  //workouts
  //TODO: Implement workout tracking

  return NextResponse.json({ imported: res }, { headers: corsHeaders });
}