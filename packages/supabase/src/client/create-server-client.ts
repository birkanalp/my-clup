/**
 * Server-side Supabase client factory.
 *
 * ⚠️ SERVER-ONLY: This module must never be imported by client apps
 * (mobile-user, mobile-admin, web-gym-admin UI, web-platform-admin UI, web-site UI).
 * Only BFF routes, API handlers, server actions, and server modules may use it.
 *
 * Uses SUPABASE_SERVICE_ROLE_KEY which bypasses RLS. All tenant and permission
 * checks must be enforced in application logic—never rely on client-side checks.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../generated/database.types';

export type ServerSupabaseClient = SupabaseClient<Database>;

export interface CreateServerClientOptions {
  /** Supabase project URL (from NEXT_PUBLIC_SUPABASE_URL or SUPABASE_URL) */
  supabaseUrl: string;
  /** Service role key — bypasses RLS; never expose to clients */
  serviceRoleKey: string;
  /** Optional: override default options passed to createClient */
  options?: Parameters<typeof createClient<Database>>[2];
}

/**
 * Creates a server-side Supabase client with service role privileges.
 *
 * This client bypasses Row Level Security. The caller is responsible for:
 * - Verifying user identity and tenant scope before any write
 * - Enforcing permission checks in application logic
 * - Never passing tenant_id or branch_id from the client without server-side validation
 *
 * @param options - supabaseUrl and serviceRoleKey (from env)
 * @returns Typed Supabase client for server use
 * @throws Error if supabaseUrl or serviceRoleKey are missing or invalid
 */
export function createServerClient(options: CreateServerClientOptions): ServerSupabaseClient {
  const { supabaseUrl, serviceRoleKey, options: clientOptions } = options;

  if (!supabaseUrl?.trim()) {
    throw new Error(
      'createServerClient: supabaseUrl is required. Set NEXT_PUBLIC_SUPABASE_URL or SUPABASE_URL.'
    );
  }
  if (!serviceRoleKey?.trim()) {
    throw new Error(
      'createServerClient: serviceRoleKey is required. Set SUPABASE_SERVICE_ROLE_KEY (server-only, never expose).'
    );
  }

  return createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    ...clientOptions,
  });
}
