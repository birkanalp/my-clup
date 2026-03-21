/**
 * POST /api/v1/auth/sign-out
 *
 * Clears the SSR session cookies and signs the user out.
 * No authentication required — clearing cookies is safe regardless of state.
 */
import * as signOutServer from '@/src/server/auth/sign-out';

export async function POST(): Promise<Response> {
  await signOutServer.signOut();
  return Response.json({ ok: true });
}
