/**
 * Get current authenticated user and profile from request.
 *
 * ⚠️ SERVER-ONLY: Use only in BFF routes, API handlers, server actions.
 *
 * Uses getSession for validation, then fetches profile from profiles table.
 */

import type { User } from '@supabase/supabase-js';
import type { Database } from '../generated/database.types';
import { createServerClient } from '../client/create-server-client';
import { getSession } from './get-session';
import type { AuthRequest } from './get-session';

export type Profile = Database['public']['Tables']['profiles']['Row'];

export interface CurrentUser {
  user: User;
  profile: Profile;
}

/**
 * Get current user and profile from request.
 *
 * Returns null if unauthenticated or profile is missing.
 * Uses service role to fetch profile (we've already validated the user).
 *
 * @param req - Request (NextRequest, standard Request)
 * @returns { user, profile } or null
 */
export async function getCurrentUser(req: AuthRequest): Promise<CurrentUser | null> {
  const session = await getSession(req);
  if (!session) return null;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

  if (!supabaseUrl?.trim() || !serviceRoleKey?.trim()) {
    return null;
  }

  const client = createServerClient({
    supabaseUrl,
    serviceRoleKey,
  });

  const { data, error } = await client
    .from('profiles')
    .select('*')
    .eq('user_id', session.user.id)
    .single();

  if (error || !data) return null;

  const profile = data as Profile;

  return {
    user: session.user,
    profile,
  };
}
