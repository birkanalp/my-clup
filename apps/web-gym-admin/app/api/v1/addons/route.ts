import { listAddonsContract } from '@myclup/contracts/addons';
import { withAuthContractRoute } from '@/src/lib/withAuthContractRoute';
import * as addonsServer from '@/src/server/addons';

export const GET = withAuthContractRoute(listAddonsContract, async (req) =>
  addonsServer.listAddons(req)
);
