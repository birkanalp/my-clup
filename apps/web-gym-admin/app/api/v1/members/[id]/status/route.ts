import type { NextRequest } from 'next/server';
import { updateMemberStatusContract } from '@myclup/contracts/members';
import { withAuthContractRoute } from '@/src/lib/withAuthContractRoute';
import * as membersServer from '@/src/server/members';

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const handler = withAuthContractRoute(updateMemberStatusContract, async (req, input) => {
    if (!input) return null;
    return membersServer.updateMemberStatus(req, id, input);
  });
  return handler(request);
}
