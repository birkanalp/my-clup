/**
 * POST /api/v1/chat/conversations/:id/assign — Assign conversation to staff
 *
 * Task 17.3, Issue #99
 */
import type { NextRequest } from 'next/server';
import { assignConversationContract } from '@myclup/contracts/chat';
import { withAuthContractRoute } from '@/src/lib/withAuthContractRoute';
import * as assignServer from '@/src/server/chat/assign';

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const handler = withAuthContractRoute(assignConversationContract, async (req, input) => {
    if (!input) return null;
    return assignServer.assignConversation(req, id, input);
  });
  return handler(request);
}
