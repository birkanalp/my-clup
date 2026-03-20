import type { NextRequest } from 'next/server';
import { cancelBookingContract } from '@myclup/contracts/bookings';
import { withAuthContractRoute } from '@/src/lib/withAuthContractRoute';
import * as bookingsServer from '@/src/server/bookings';

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const handler = withAuthContractRoute(cancelBookingContract, async (req, input) => {
    if (!input) return null;
    return bookingsServer.cancelExistingBooking(req, id, input);
  });
  return handler(request);
}
