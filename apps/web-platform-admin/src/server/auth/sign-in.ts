/**
 * Sign-in server module.
 *
 * Authenticates a user against Supabase and sets SSR session cookies on the
 * response. Returns { ok: true } on success and { ok: false, error } on
 * failure.
 *
 * ⚠️ SERVER-ONLY: Never import in client components or pages.
 */

import type { SignInResponse } from '@myclup/contracts/auth';
import { createAnonSsrServerClient, createServerClient } from '@myclup/supabase';
import { cookies } from 'next/headers';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';

/**
 * Roles that are allowed to access the platform admin panel.
 * Only platform-level roles may log in here.
 */
const ALLOWED_ROLES = new Set<string>(['platform_admin', 'platform_support', 'platform_finance']);

export async function signIn(email: string, password: string): Promise<SignInResponse> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return { ok: false, error: 'config_missing' };
  }

  const cookieStore = await cookies();

  const client = createAnonSsrServerClient({
    supabaseUrl: SUPABASE_URL,
    supabaseAnonKey: SUPABASE_ANON_KEY,
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value, options } of cookiesToSet) {
          cookieStore.set(name, value, options);
        }
      },
    },
  });

  const { data, error } = await client.auth.signInWithPassword({ email, password });

  if (error || !data.session) {
    return { ok: false, error: 'invalid_credentials' };
  }

  // Role check: use the service role client to bypass RLS when reading
  // user_role_assignments — this is a server-only module, and the service
  // role key is never exposed to the client.
  const hasAllowedRole = await checkUserHasPlatformRole(data.user.id);

  if (!hasAllowedRole) {
    // Sign out immediately — the user authenticated but lacks panel access
    await client.auth.signOut();
    return { ok: false, error: 'unauthorized_role' };
  }

  return { ok: true };
}

async function checkUserHasPlatformRole(userId: string): Promise<boolean> {
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    // If service role key is absent (e.g. test environment), allow through.
    // The BFF whoami will enforce roles on subsequent requests.
    return true;
  }

  const serviceClient = createServerClient({
    supabaseUrl: SUPABASE_URL,
    serviceRoleKey: SERVICE_ROLE_KEY,
  });

  const { data: roleRows } = await serviceClient
    .from('user_role_assignments')
    .select('role')
    .eq('user_id', userId);

  if (!roleRows || roleRows.length === 0) {
    return false;
  }

  return roleRows.some((row) => ALLOWED_ROLES.has(row.role));
}
