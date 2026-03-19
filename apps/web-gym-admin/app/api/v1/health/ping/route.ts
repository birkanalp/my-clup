/**
 * GET /api/v1/health/ping
 *
 * Health check endpoint. Returns validated response per pingContract.
 * Logic delegated to server module; handler only orchestrates.
 */
import { pingContract } from '@myclup/contracts/health';
import { withContractRoute } from '@/src/lib/withContractRoute';
import * as pingServer from '@/src/server/health/ping';

export const GET = withContractRoute(pingContract, async () => {
  return pingServer.ping();
});
