import type { NextRequest } from 'next/server';
import { cancelMembershipContract } from '@myclup/contracts/membership';
import { withAuthContractRoute } from '@/src/lib/withAuthContractRoute';
import * as instancesServer from '@/src/server/membership/instances';

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const handler = withAuthContractRoute(cancelMembershipContract, async (req, input) => {
    if (!input) return null;
    return instancesServer.cancelInstance(req, id, input);
  });
  return handler(request);
}
