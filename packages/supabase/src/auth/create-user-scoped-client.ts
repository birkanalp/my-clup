/**
 * Create a Supabase client scoped to the authenticated user.
 *
 * ⚠️ SERVER-ONLY: Use only in BFF routes, API handlers, server actions.
 *
 * This client uses the user's JWT; RLS policies apply. Use for operations
 * that must respect tenant and row-level security.
 */

import { createClient, SupabaseClient } from "@supabase/supabase-js";
import type { Session } from "@supabase/supabase-js";
import type { Database } from "../generated/database.types";

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "";
const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  "";

export type UserScopedSupabaseClient = SupabaseClient<Database>;

/**
 * Create a Supabase client with user context (RLS applies).
 *
 * Uses anon key with Authorization: Bearer <session.access_token> so all
 * requests run under the user's identity. RLS policies are enforced.
 *
 * @param session - Validated Supabase session (from getSession)
 * @returns Typed Supabase client for user-scoped operations
 * @throws Error if supabaseUrl or anonKey are missing
 */
export function createUserScopedClient(
  session: Session
): UserScopedSupabaseClient {
  if (!SUPABASE_URL?.trim()) {
    throw new Error(
      "createUserScopedClient: supabaseUrl is required. Set NEXT_PUBLIC_SUPABASE_URL or SUPABASE_URL."
    );
  }
  if (!SUPABASE_ANON_KEY?.trim()) {
    throw new Error(
      "createUserScopedClient: anonKey is required. Set NEXT_PUBLIC_SUPABASE_ANON_KEY or SUPABASE_ANON_KEY."
    );
  }

  return createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    global: {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    },
  });
}
