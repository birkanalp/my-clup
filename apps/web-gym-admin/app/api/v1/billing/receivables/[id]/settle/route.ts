import type { NextRequest } from 'next/server';
import { settleReceivableContract } from '@myclup/contracts/billing';
import { withAuthContractRoute } from '@/src/lib/withAuthContractRoute';
import * as billingServer from '@/src/server/billing';

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const handler = withAuthContractRoute(settleReceivableContract, async (req, input) => {
    if (!input) return null;
    return billingServer.settleReceivableServer(req, id, input);
  });
  return handler(request);
}
