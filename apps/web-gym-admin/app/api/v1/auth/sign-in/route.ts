/**
 * POST /api/v1/auth/sign-in
 *
 * Authenticates a gym admin user, sets SSR session cookies, and performs a
 * role gate to ensure only gym panel roles can access the panel.
 */
import { signInContract } from '@myclup/contracts/auth';
import { withContractRoute } from '@/src/lib/withContractRoute';
import * as signInServer from '@/src/server/auth/sign-in';

export const POST = withContractRoute(signInContract, async (body) => {
  if (!body) {
    return { ok: false as const, error: 'validation_error' };
  }
  return signInServer.signIn(body.email, body.password);
});
