/**
 * GET /api/v1/chat/templates — List message templates (locale-aware)
 *
 * Task 17.6, Issue #102
 */
import { listTemplatesContract } from '@myclup/contracts/chat';
import { withAuthContractRoute } from '@/src/lib/withAuthContractRoute';
import * as templatesServer from '@/src/server/chat/templates';

export const GET = withAuthContractRoute(listTemplatesContract, (req) =>
  templatesServer.listTemplates(req)
);
