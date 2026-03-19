import type { NextRequest } from 'next/server';
import {
  deactivateMembershipPlanContract,
  updateMembershipPlanContract,
} from '@myclup/contracts/membership';
import { withAuthContractRoute } from '@/src/lib/withAuthContractRoute';
import * as plansServer from '@/src/server/membership/plans';

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const handler = withAuthContractRoute(updateMembershipPlanContract, async (req, input) => {
    if (!input) return null;
    return plansServer.updatePlan(req, id, input);
  });
  return handler(request);
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const handler = withAuthContractRoute(deactivateMembershipPlanContract, (req) =>
    plansServer.removePlan(req, id)
  );
  return handler(request);
}
