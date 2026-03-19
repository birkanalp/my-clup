/**
 * GET /api/v1/chat/conversations — List conversations (cursor pagination)
 * POST /api/v1/chat/conversations — Create conversation
 *
 * Task 17.3, Issue #99
 */
import { listConversationsContract, createConversationContract } from '@myclup/contracts/chat';
import { withAuthContractRoute } from '@/src/lib/withAuthContractRoute';
import * as convServer from '@/src/server/chat/conversations';

export const GET = withAuthContractRoute(listConversationsContract, async (req) =>
  convServer.listConversations(req)
);

export const POST = withAuthContractRoute(createConversationContract, async (req, input) => {
  if (!input) return null;
  return convServer.createConversation(req, input);
});
