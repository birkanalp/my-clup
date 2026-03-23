import { getBillingSummaryContract } from '@myclup/contracts/billing';
import { withAuthContractRoute } from '@/src/lib/withAuthContractRoute';
import * as billingServer from '@/src/server/billing';

export const GET = withAuthContractRoute(getBillingSummaryContract, async (req) => {
  const sp = req.nextUrl.searchParams;
  return billingServer.getBillingSummaryServer(req, {
    gymId: sp.get('gymId') ?? undefined,
    branchId: sp.get('branchId') ?? undefined,
  });
});
