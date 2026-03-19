/**
 * Whoami server module.
 *
 * Returns the authenticated user, profile, primary tenant scope, and role
 * assignments. Lazy-creates a profile row if the user exists in Supabase
 * auth but has no profile yet (first authenticated request).
 *
 * ⚠️ SERVER-ONLY: Never import in client components or pages.
 */

import type { NextRequest } from 'next/server';
import type { WhoamiResponse } from '@myclup/contracts/auth';
import {
  getSession,
  getCurrentUser,
  createServerClient,
  resolveTenantScope,
} from '@myclup/supabase';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

/**
 * Lazy-create a profile for a user who has just authenticated for the first time.
 * Uses the service role client; returns the created profile row.
 */
async function createDefaultProfile(userId: string): Promise<{
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  locale: string;
  fallback_locale: string;
  created_at: string;
  updated_at: string;
} | null> {
  const client = createServerClient({
    supabaseUrl: SUPABASE_URL,
    serviceRoleKey: SERVICE_ROLE_KEY,
  });

  const { data, error } = await client
    .from('profiles')
    .insert({
      user_id: userId,
      display_name: 'New User',
      locale: 'tr',
      fallback_locale: 'en',
    })
    .select('*')
    .single();

  if (error) {
    console.error('[auth/whoami] failed to create default profile:', error);
    return null;
  }

  return data as typeof data & {
    user_id: string;
    display_name: string;
    avatar_url: string | null;
    locale: string;
    fallback_locale: string;
    created_at: string;
    updated_at: string;
  };
}

/**
 * Resolve the primary tenant scope for whoami response.
 * Returns the first scope found, or a synthetic scope for platform admins
 * when no gym-specific scope is available.
 */
async function resolvePrimaryScope(userId: string): Promise<WhoamiResponse['tenantScope'] | null> {
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) return null;

  const client = createServerClient({
    supabaseUrl: SUPABASE_URL,
    serviceRoleKey: SERVICE_ROLE_KEY,
  });
  const scopes = await resolveTenantScope(client, userId);

  if (scopes.length > 0) {
    return scopes[0];
  }

  return null;
}

/**
 * Fetch user role assignments from user_role_assignments.
 */
async function fetchRoleAssignments(userId: string): Promise<WhoamiResponse['roles']> {
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) return [];

  const client = createServerClient({
    supabaseUrl: SUPABASE_URL,
    serviceRoleKey: SERVICE_ROLE_KEY,
  });

  const { data, error } = await client
    .from('user_role_assignments')
    .select('user_id, role, gym_id, branch_id, granted_at, granted_by')
    .eq('user_id', userId);

  if (error || !data) return [];

  return data.map((row) => ({
    userId: row.user_id,
    role: row.role as WhoamiResponse['roles'][number]['role'],
    gymId: row.gym_id,
    branchId: row.branch_id,
    grantedAt: row.granted_at,
    grantedBy: row.granted_by,
  }));
}

/**
 * Handle the whoami request.
 *
 * @param req - Authenticated Next.js request
 * @returns WhoamiResponse | null (null = unauthenticated)
 */
export async function whoami(req: NextRequest): Promise<WhoamiResponse | null> {
  const currentUser = await getCurrentUser(req);

  if (!currentUser) {
    // Try lazy profile creation path: check if there's a valid session but no profile
    const session = await getSession(req);
    if (!session) return null;

    // User has a valid session but no profile — create one
    const created = await createDefaultProfile(session.user.id);
    if (!created) return null;

    // Retry getCurrentUser after profile creation
    const retried = await getCurrentUser(req);
    if (!retried) return null;

    return buildResponse(retried.user, retried.profile, session.user.id);
  }

  return buildResponse(currentUser.user, currentUser.profile, currentUser.user.id);
}

type ProfileRow = {
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  locale: string;
  fallback_locale: string;
  created_at: string;
  updated_at: string;
};

async function buildResponse(
  user: {
    id: string;
    email?: string | null;
    phone?: string | null;
    created_at?: string;
    updated_at?: string;
  },
  profile: ProfileRow,
  userId: string
): Promise<WhoamiResponse> {
  const [tenantScope, roles] = await Promise.all([
    resolvePrimaryScope(userId),
    fetchRoleAssignments(userId),
  ]);

  return {
    user: {
      id: user.id,
      email: user.email ?? null,
      phone: user.phone ?? null,
      createdAt: user.created_at ?? profile.created_at,
      updatedAt: user.updated_at ?? profile.updated_at,
    },
    profile: {
      userId: profile.user_id,
      displayName: profile.display_name,
      avatarUrl: profile.avatar_url,
      localePreference: {
        locale: profile.locale as 'tr' | 'en',
        fallbackLocale: profile.fallback_locale as 'tr' | 'en' | undefined,
      },
      createdAt: profile.created_at,
      updatedAt: profile.updated_at,
    },
    tenantScope: tenantScope ?? { gymId: '', branchId: null },
    roles,
  };
}
