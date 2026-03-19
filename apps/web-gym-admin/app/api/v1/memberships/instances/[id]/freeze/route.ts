import type { NextRequest } from 'next/server';
import { freezeMembershipContract } from '@myclup/contracts/membership';
import { withAuthContractRoute } from '@/src/lib/withAuthContractRoute';
import * as instancesServer from '@/src/server/membership/instances';

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const handler = withAuthContractRoute(freezeMembershipContract, async (req, input) => {
    if (!input) return null;
    return instancesServer.freezeInstance(req, id, input);
  });
  return handler(request);
}
