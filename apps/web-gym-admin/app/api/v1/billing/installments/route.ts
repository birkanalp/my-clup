import { listInstallmentsContract } from '@myclup/contracts/billing';
import { withAuthContractRoute } from '@/src/lib/withAuthContractRoute';
import * as billingServer from '@/src/server/billing';

export const GET = withAuthContractRoute(listInstallmentsContract, async (req) =>
  billingServer.listInstallmentsServer(req)
);
