/**
 * Extract and validate Supabase session from a request.
 *
 * ⚠️ SERVER-ONLY: Use only in BFF routes, API handlers, server actions.
 *
 * Supports:
 * - Cookie-based flow: Next.js server components / API routes (via @supabase/ssr)
 * - Bearer-token flow: Mobile client calls (Authorization: Bearer <token>)
 *
 * Validation: Uses auth.getUser() to validate the token; never trusts
 * getSession() alone for authorization (see @supabase/ssr docs).
 */

import type { Session } from '@supabase/supabase-js';
import { createClient } from '@supabase/supabase-js';
import { createServerClient, parseCookieHeader } from '@supabase/ssr';
import type { Database } from '../generated/database.types';

/** Request-like object (NextRequest, standard Request). Must have headers. */
export interface AuthRequest {
  headers: Headers | { get(name: string): string | null };
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';

/**
 * Extract Bearer token from Authorization header.
 * Returns null if header is missing, malformed, or not Bearer.
 */
function extractBearerToken(req: AuthRequest): string | null {
  const auth = req.headers.get('Authorization');
  if (!auth || !auth.startsWith('Bearer ')) return null;
  const token = auth.slice(7).trim();
  return token || null;
}

/**
 * Get validated Supabase session from request.
 *
 * Tries Bearer token first (for mobile), then cookies (for Next.js).
 * Always validates the token via auth.getUser() before returning.
 *
 * @param req - Request (NextRequest extends Request; standard Web API)
 * @returns Validated session or null if unauthenticated/invalid
 */
export async function getSession(req: AuthRequest): Promise<Session | null> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return null;
  }

  const bearerToken = extractBearerToken(req);

  if (bearerToken) {
    return getSessionFromBearer(bearerToken);
  }

  return getSessionFromCookies(req);
}

async function getSessionFromBearer(accessToken: string): Promise<Session | null> {
  const client = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const {
    data: { user },
    error,
  } = await client.auth.getUser(accessToken);
  if (error || !user) return null;

  return {
    access_token: accessToken,
    refresh_token: '',
    expires_in: 0,
    expires_at: 0,
    token_type: 'bearer',
    user,
  };
}

async function getSessionFromCookies(req: AuthRequest): Promise<Session | null> {
  const cookieHeader = req.headers.get('Cookie') ?? '';
  const parsed = parseCookieHeader(cookieHeader);
  const cookies = parsed.map((c) => ({ name: c.name, value: c.value ?? '' }));

  const client = createServerClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookies;
      },
      setAll() {
        // No-op for read-only session extraction (API routes handle refresh separately)
      },
    },
  });

  const {
    data: { session },
  } = await client.auth.getSession();
  if (!session) return null;

  const {
    data: { user },
    error,
  } = await client.auth.getUser(session.access_token);
  if (error || !user) return null;

  return session;
}
