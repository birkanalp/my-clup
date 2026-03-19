import { createInvoiceContract, listInvoicesContract } from '@myclup/contracts/billing';
import { withAuthContractRoute } from '@/src/lib/withAuthContractRoute';
import * as billingServer from '@/src/server/billing';

export const GET = withAuthContractRoute(listInvoicesContract, async (req) =>
  billingServer.listInvoicesServer(req)
);

export const POST = withAuthContractRoute(createInvoiceContract, async (req, input) => {
  if (!input) return null;
  return billingServer.createInvoiceServer(req, input);
});
