/**
 * POST /api/v1/chat/conversations/:id/messages/template — Send message using template
 *
 * Task 17.6, Issue #102
 */
import type { NextRequest } from 'next/server';
import { sendTemplateContract } from '@myclup/contracts/chat';
import { withAuthContractRoute } from '@/src/lib/withAuthContractRoute';
import * as templatesServer from '@/src/server/chat/templates';

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const handler = withAuthContractRoute(sendTemplateContract, async (req, input) => {
    if (!input) return null;
    return templatesServer.sendTemplate(req, id, input);
  });
  return handler(request);
}
