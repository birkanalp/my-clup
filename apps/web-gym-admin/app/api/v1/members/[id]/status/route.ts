import { updateMemberStatusContract } from '@myclup/contracts/members';
import { withAuthContractRoute } from '@/src/lib/withAuthContractRoute';
import * as membersServer from '@/src/server/members/index';

export const PATCH = withAuthContractRoute(updateMemberStatusContract, async (req, input) => {
  if (!input) return null;
  const segments = req.nextUrl.pathname.split('/');
  // path: /api/v1/members/[id]/status — id is segment at index -2
  const memberId = segments[segments.length - 2] ?? '';
  return membersServer.updateMemberStatus(req, memberId, input);
});
