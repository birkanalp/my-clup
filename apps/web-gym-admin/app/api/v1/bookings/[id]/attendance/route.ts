import type { NextRequest } from 'next/server';
import { updateAttendanceContract } from '@myclup/contracts/bookings';
import { withAuthContractRoute } from '@/src/lib/withAuthContractRoute';
import * as bookingsServer from '@/src/server/bookings';

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const handler = withAuthContractRoute(updateAttendanceContract, async (req, input) => {
    if (!input) return null;
    return bookingsServer.patchAttendance(req, id, input);
  });
  return handler(request);
}
