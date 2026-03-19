/**
 * PATCH /api/v1/auth/profile
 *
 * Updates the authenticated user's profile (displayName, avatarUrl, localePreference).
 * Returns 401 when unauthenticated.
 * Input is validated against profilePatchContract.request before reaching the handler.
 */
import { profilePatchContract } from '@myclup/contracts/auth';
import { withAuthContractRoute } from '@/src/lib/withAuthContractRoute';
import * as profileServer from '@/src/server/auth/profile';

export const PATCH = withAuthContractRoute(profilePatchContract, async (request, input) => {
  if (!input) return null;
  return profileServer.patchProfile(request, input);
});
