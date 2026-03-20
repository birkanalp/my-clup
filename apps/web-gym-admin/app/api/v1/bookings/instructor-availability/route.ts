import { listInstructorAvailabilityContract } from '@myclup/contracts/bookings';
import { withAuthContractRoute } from '@/src/lib/withAuthContractRoute';
import * as bookingsServer from '@/src/server/bookings';

export const GET = withAuthContractRoute(listInstructorAvailabilityContract, async (req) =>
  bookingsServer.listAvailability(req)
);
