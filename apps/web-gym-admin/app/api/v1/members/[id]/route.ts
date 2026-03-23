import { getMemberContract } from '@myclup/contracts/members';
import { withAuthContractRoute } from '@/src/lib/withAuthContractRoute';
import * as membersServer from '@/src/server/members/index';

export const GET = withAuthContractRoute(getMemberContract, async (req) => {
  const memberId = req.nextUrl.pathname.split('/').pop() ?? '';
  return membersServer.getMember(req, memberId);
});
