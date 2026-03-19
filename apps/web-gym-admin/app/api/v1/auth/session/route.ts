/**
 * GET /api/v1/auth/session
 *
 * Returns session validity. Does not require authentication to call —
 * returns { valid: false } for unauthenticated requests.
 */
import { sessionContract } from '@myclup/contracts/auth';
import { withContractRoute } from '@/src/lib/withContractRoute';
import type { NextRequest } from 'next/server';
import * as sessionServer from '@/src/server/auth/session';

// Session check uses the raw request; bypass withContractRoute's handler
// signature limitation by delegating to a thin wrapper.
export const GET = (request: NextRequest) => {
  return withContractRoute(sessionContract, async () => {
    return sessionServer.session(request);
  })(request);
};
