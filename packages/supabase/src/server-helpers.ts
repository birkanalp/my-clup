/**
 * Request-oriented helpers (Epic #14 / issue #55 naming).
 *
 * Prefer the canonical names {@link getSession} and {@link resolveTenantScope} in new code;
 * these exports preserve the task contract and delegate to the real implementations.
 */

import type { User } from '@supabase/supabase-js';
import type { TenantScope } from '@myclup/types';
import type { ServerSupabaseClient } from './client/create-server-client';
import { getSession, type AuthRequest } from './auth/get-session';
import { resolveTenantScope } from './auth/permissions';

/**
 * Returns the authenticated Supabase user for the request, or null.
 * Delegates to {@link getSession} and reads `session.user`.
 */
export async function getUserFromRequest(req: AuthRequest): Promise<User | null> {
  const session = await getSession(req);
  return session?.user ?? null;
}

/**
 * Resolves tenant scopes for a user. Delegates to {@link resolveTenantScope}.
 */
export async function getTenantScope(
  client: ServerSupabaseClient,
  userId: string,
  gymId?: string,
  branchId?: string
): Promise<TenantScope[]> {
  return resolveTenantScope(client, userId, gymId, branchId);
}
