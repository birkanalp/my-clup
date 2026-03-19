/**
 * PATCH /api/v1/chat/messages/:id/receipts — Mark message as read
 *
 * Task 17.3, Issue #99
 */
import type { NextRequest } from 'next/server';
import { markReadContract } from '@myclup/contracts/chat';
import { withAuthContractRoute } from '@/src/lib/withAuthContractRoute';
import * as receiptsServer from '@/src/server/chat/receipts';

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const handler = withAuthContractRoute(markReadContract, (req) =>
    receiptsServer.markRead(req, id)
  );
  return handler(request);
}
