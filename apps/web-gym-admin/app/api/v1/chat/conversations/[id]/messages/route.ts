/**
 * GET /api/v1/chat/conversations/:id/messages — List messages (cursor pagination)
 * POST /api/v1/chat/conversations/:id/messages — Send message (idempotent via dedupe_key)
 *
 * Task 17.3, Issue #99
 */
import type { NextRequest } from 'next/server';
import { listMessagesContract, sendMessageContract } from '@myclup/contracts/chat';
import { withAuthContractRoute } from '@/src/lib/withAuthContractRoute';
import * as msgServer from '@/src/server/chat/messages';

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const handler = withAuthContractRoute(listMessagesContract, (req) =>
    msgServer.listMessages(req, id)
  );
  return handler(request);
}

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const handler = withAuthContractRoute(sendMessageContract, async (req, input) => {
    if (!input) return null;
    return msgServer.sendMessage(req, id, input);
  });
  return handler(request);
}
