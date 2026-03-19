/**
 * GET /api/v1/chat/conversations/:id — Get single conversation with participants and assignment
 *
 * Task 17.3, Issue #99
 */
import type { NextRequest } from 'next/server';
import { getConversationContract } from '@myclup/contracts/chat';
import { withAuthContractRoute } from '@/src/lib/withAuthContractRoute';
import * as convServer from '@/src/server/chat/conversations';

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const handler = withAuthContractRoute(getConversationContract, (req) =>
    convServer.getConversation(req, id)
  );
  return handler(request);
}
