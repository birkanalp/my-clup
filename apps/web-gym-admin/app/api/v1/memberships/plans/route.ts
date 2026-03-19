import {
  createMembershipPlanContract,
  listMembershipPlansContract,
} from '@myclup/contracts/membership';
import { withAuthContractRoute } from '@/src/lib/withAuthContractRoute';
import * as plansServer from '@/src/server/membership/plans';

export const GET = withAuthContractRoute(listMembershipPlansContract, async (req) =>
  plansServer.listPlans(req)
);

export const POST = withAuthContractRoute(createMembershipPlanContract, async (req, input) => {
  if (!input) return null;
  return plansServer.createPlan(req, input);
});
