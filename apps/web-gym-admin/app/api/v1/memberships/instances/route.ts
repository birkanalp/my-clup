import {
  assignMembershipInstanceContract,
  listMembershipInstancesContract,
} from '@myclup/contracts/membership';
import { withAuthContractRoute } from '@/src/lib/withAuthContractRoute';
import * as instancesServer from '@/src/server/membership/instances';

export const GET = withAuthContractRoute(listMembershipInstancesContract, async (req) =>
  instancesServer.listInstances(req)
);

export const POST = withAuthContractRoute(assignMembershipInstanceContract, async (req, input) => {
  if (!input) return null;
  return instancesServer.assignInstance(req, input);
});
