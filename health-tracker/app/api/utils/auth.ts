import { NextRequest } from 'next/server';
import { supabaseAdmin } from '../../../services/supabaseAdmin';

export async function validateSyncToken(request: NextRequest) {
  let token = '';
  const authHeader = request.headers.get('authorization');
  const apiKeyHeader = request.headers.get('x-api-key');

  if (authHeader?.startsWith('Bearer ')) {
    token = authHeader.substring(7).trim();
  } else if (apiKeyHeader) {
    token = apiKeyHeader.trim();
  } else {
    return { error: 'Missing Authorization header', status: 401 };
  }

  const { data: profile, error } = await supabaseAdmin
    .from('profiles')
    .select('id')
    .eq('health_sync_token', token)
    .single();

  if (error || !profile) {
    return { error: 'Invalid token', status: 401 };
  }

  return { userId: profile.id };
}
