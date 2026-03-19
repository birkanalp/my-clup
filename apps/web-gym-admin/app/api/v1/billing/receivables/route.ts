import { listReceivablesContract } from '@myclup/contracts/billing';
import { withAuthContractRoute } from '@/src/lib/withAuthContractRoute';
import * as billingServer from '@/src/server/billing';

export const GET = withAuthContractRoute(listReceivablesContract, async (req) =>
  billingServer.listReceivablesServer(req)
);
