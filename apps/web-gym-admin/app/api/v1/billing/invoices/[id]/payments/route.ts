import type { NextRequest } from 'next/server';
import { recordInvoicePaymentContract } from '@myclup/contracts/billing';
import { withAuthContractRoute } from '@/src/lib/withAuthContractRoute';
import * as billingServer from '@/src/server/billing';

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const handler = withAuthContractRoute(recordInvoicePaymentContract, async (req, input) => {
    if (!input) return null;
    return billingServer.recordInvoicePaymentServer(req, id, input);
  });
  return handler(request);
}
