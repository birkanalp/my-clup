/**
 * Supabase clients using the **anon** key and `@supabase/ssr`.
 *
 * Use `createAnonBrowserClient` in browser / client components.
 * Use `createAnonSsrServerClient` in SSR routes (Next.js App Router, middleware, etc.)
 * with a correct `cookies` adapter.
 *
 * For privileged **service role** access (RLS bypass), use {@link createServerClient}
 * from `./client` instead — never expose the service role key to clients.
 */

import { createBrowserClient, createServerClient } from '@supabase/ssr';
import type { CookieMethodsServer } from '@supabase/ssr';
import type { Database } from '../generated/database.types';

export interface CreateAnonBrowserClientOptions {
  supabaseUrl: string;
  /** Public anon key — safe for browser bundles */
  supabaseAnonKey: string;
}

/**
 * Browser Supabase client (anon key, typed `Database`).
 * Callers pass URL and key from env at the call site — this module does not read `process.env`.
 */
export function createAnonBrowserClient(options: CreateAnonBrowserClientOptions) {
  const { supabaseUrl, supabaseAnonKey } = options;
  if (!supabaseUrl?.trim()) {
    throw new Error('createAnonBrowserClient: supabaseUrl is required');
  }
  if (!supabaseAnonKey?.trim()) {
    throw new Error(
      'createAnonBrowserClient: supabaseAnonKey is required (anon key only — never service role)'
    );
  }
  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
}

export interface CreateAnonSsrServerClientOptions {
  supabaseUrl: string;
  supabaseAnonKey: string;
  cookies: CookieMethodsServer;
}

/**
 * Server-side SSR Supabase client (anon key + cookie session).
 * Configure `cookies` per your framework (e.g. Next.js `cookies()` from `next/headers`).
 */
export function createAnonSsrServerClient(options: CreateAnonSsrServerClientOptions) {
  const { supabaseUrl, supabaseAnonKey, cookies } = options;
  if (!supabaseUrl?.trim()) {
    throw new Error('createAnonSsrServerClient: supabaseUrl is required');
  }
  if (!supabaseAnonKey?.trim()) {
    throw new Error(
      'createAnonSsrServerClient: supabaseAnonKey is required (anon key only — never service role)'
    );
  }
  return createServerClient<Database>(supabaseUrl, supabaseAnonKey, { cookies });
}

/** Anon-key Supabase client returned by {@link createAnonBrowserClient} / {@link createAnonSsrServerClient}. */
export type AnonSupabaseClient = ReturnType<typeof createAnonBrowserClient>;
