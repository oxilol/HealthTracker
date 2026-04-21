import { NextRequest, NextResponse } from 'next/server';
import { validateSyncToken } from '../utils/auth';

export const dynamic = 'force-dynamic';

export const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-api-key',
};

// OPTIONS: Handles CORS preflight requests for the external HealthSync app
export async function OPTIONS() {
    return new NextResponse(null, { status: 204, headers: corsHeaders });
}

// GET: Provides route verification for the HealthSync application
export async function GET() {
    return NextResponse.json(
        { status: 'ok', route: '/api/import/health-app' },
        { headers: corsHeaders }
    );
}

// POST: Testing/debugging endpoint that logs the raw sync payload it receives
export async function POST(request: NextRequest) {
    try {
        const { error, status } = await validateSyncToken(request);
        if (error) {
            return NextResponse.json({ error }, { status, headers: corsHeaders });
        }

        const rawBody = await request.json().catch(() => null);
        if (!rawBody) {
            return NextResponse.json({ error: 'Invalid JSON' }, { status: 400, headers: corsHeaders });
        }

        console.log('HealthSync payload:', JSON.stringify(rawBody, null, 2));

        return NextResponse.json({ message: 'Payload logged, check logs' }, { headers: corsHeaders });
    } catch (error) {
        console.error('HealthSync API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500, headers: corsHeaders });
    }
}