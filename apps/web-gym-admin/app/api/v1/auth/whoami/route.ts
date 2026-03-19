/**
 * GET /api/v1/auth/whoami
 *
 * Returns authenticated user, profile, primary tenant scope, and role assignments.
 * Lazy-creates a profile on first authenticated request if none exists.
 * Returns 401 when unauthenticated.
 */
import { whoamiContract } from '@myclup/contracts/auth';
import { withAuthContractRoute } from '@/src/lib/withAuthContractRoute';
import * as whoamiServer from '@/src/server/auth/whoami';

export const GET = withAuthContractRoute(whoamiContract, async (request) => {
  return whoamiServer.whoami(request);
});
