import type { NextRequest } from 'next/server';
import { getBookingSessionContract } from '@myclup/contracts/bookings';
import { withAuthContractRoute } from '@/src/lib/withAuthContractRoute';
import * as bookingsServer from '@/src/server/bookings';

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const handler = withAuthContractRoute(getBookingSessionContract, (req) =>
    bookingsServer.getSession(req, id)
  );
  return handler(request);
}
