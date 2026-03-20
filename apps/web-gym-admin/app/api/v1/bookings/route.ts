import { createBookingContract, listBookingsContract } from '@myclup/contracts/bookings';
import { withAuthContractRoute } from '@/src/lib/withAuthContractRoute';
import * as bookingsServer from '@/src/server/bookings';

export const GET = withAuthContractRoute(listBookingsContract, async (req) =>
  bookingsServer.listAllBookings(req)
);

export const POST = withAuthContractRoute(createBookingContract, async (req, input) => {
  if (!input) return null;
  return bookingsServer.createNewBooking(req, input);
});
