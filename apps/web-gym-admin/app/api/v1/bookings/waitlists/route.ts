import { joinWaitlistContract } from '@myclup/contracts/bookings';
import { withAuthContractRoute } from '@/src/lib/withAuthContractRoute';
import * as bookingsServer from '@/src/server/bookings';

export const POST = withAuthContractRoute(joinWaitlistContract, async (req, input) => {
  if (!input) return null;
  return bookingsServer.createWaitlistEntry(req, input);
});
