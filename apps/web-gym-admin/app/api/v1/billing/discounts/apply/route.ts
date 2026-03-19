import { applyDiscountContract } from '@myclup/contracts/billing';
import { withAuthContractRoute } from '@/src/lib/withAuthContractRoute';
import * as billingServer from '@/src/server/billing';

export const POST = withAuthContractRoute(applyDiscountContract, async (req, input) => {
  if (!input) return null;
  return billingServer.applyDiscountServer(req, input);
});
