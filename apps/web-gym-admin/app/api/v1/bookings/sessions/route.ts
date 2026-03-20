import { listBookingSessionsContract } from '@myclup/contracts/bookings';
import { withAuthContractRoute } from '@/src/lib/withAuthContractRoute';
import * as bookingsServer from '@/src/server/bookings';

export const GET = withAuthContractRoute(listBookingSessionsContract, async (req) =>
  bookingsServer.listSessions(req)
);
