import { createServerClient } from '@myclup/supabase';
import type { ServerSupabaseClient } from '@myclup/supabase';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';

export function getPlatformServiceClient(): ServerSupabaseClient | null {
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    return null;
  }
  return createServerClient({ supabaseUrl: SUPABASE_URL, serviceRoleKey: SERVICE_ROLE_KEY });
}
