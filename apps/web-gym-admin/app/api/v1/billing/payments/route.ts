import { listPaymentsContract, logPaymentContract } from '@myclup/contracts/billing';
import { withAuthContractRoute } from '@/src/lib/withAuthContractRoute';
import * as billingServer from '@/src/server/billing';

export const GET = withAuthContractRoute(listPaymentsContract, async (req) =>
  billingServer.listPaymentsServer(req)
);

export const POST = withAuthContractRoute(logPaymentContract, async (req, input) => {
  if (!input) return null;
  return billingServer.logPaymentServer(req, input);
});
