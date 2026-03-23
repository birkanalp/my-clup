import { listMembersContract } from '@myclup/contracts/members';
import { withAuthContractRoute } from '@/src/lib/withAuthContractRoute';
import * as membersServer from '@/src/server/members/index';

export const GET = withAuthContractRoute(listMembersContract, async (req) =>
  membersServer.listMembers(req)
);
