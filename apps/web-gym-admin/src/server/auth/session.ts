/**
 * Session server module.
 *
 * Returns session validity for the current request.
 *
 * ⚠️ SERVER-ONLY: Never import in client components or pages.
 */

import type { NextRequest } from 'next/server';
import type { SessionResponse } from '@myclup/contracts/auth';
import { getSession } from '@myclup/supabase';

/**
 * Check whether the current request has a valid authenticated session.
 *
 * @param req - Next.js request
 * @returns SessionResponse with valid: true/false
 */
export async function session(req: NextRequest): Promise<SessionResponse> {
  const sess = await getSession(req);
  return { valid: sess !== null };
}
