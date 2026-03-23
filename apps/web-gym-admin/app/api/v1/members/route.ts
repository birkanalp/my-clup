import { listGymMembersContract } from '@myclup/contracts/members';
import { withAuthContractRoute } from '@/src/lib/withAuthContractRoute';
import * as membersServer from '@/src/server/members';

export const GET = withAuthContractRoute(listGymMembersContract, async (req) =>
  membersServer.listMembers(req)
);
