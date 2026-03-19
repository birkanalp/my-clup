/**
 * GET /api/v1/chat/quick-replies — List quick replies (locale-aware)
 *
 * Task 17.6, Issue #102
 */
import { listQuickRepliesContract } from '@myclup/contracts/chat';
import { withAuthContractRoute } from '@/src/lib/withAuthContractRoute';
import * as quickRepliesServer from '@/src/server/chat/quick-replies';

export const GET = withAuthContractRoute(listQuickRepliesContract, (req) =>
  quickRepliesServer.listQuickReplies(req)
);
