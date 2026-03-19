import type { NextRequest } from 'next/server';
import { getInvoiceDetailContract } from '@myclup/contracts/billing';
import { withAuthContractRoute } from '@/src/lib/withAuthContractRoute';
import * as billingServer from '@/src/server/billing';

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const handler = withAuthContractRoute(getInvoiceDetailContract, (req) =>
    billingServer.getInvoiceDetailServer(req, id)
  );
  return handler(request);
}
