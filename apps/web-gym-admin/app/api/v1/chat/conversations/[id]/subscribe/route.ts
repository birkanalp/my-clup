/**
 * GET /api/v1/chat/conversations/:id/subscribe — Validate chat Realtime subscription
 *
 * Returns channel params for Supabase Realtime: postgres_changes (messages),
 * presence, typing. Tenant isolation and membership enforced server-side.
 *
 * Task 17.5, Issue #101
 */
import type { NextRequest } from 'next/server';
import { validateChatSubscribeContract } from '@myclup/contracts/chat';
import { withAuthContractRoute } from '@/src/lib/withAuthContractRoute';
import * as subscribeServer from '@/src/server/chat/subscribe';

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const handler = withAuthContractRoute(validateChatSubscribeContract, (req) =>
    subscribeServer.validateChatSubscription(req, id)
  );
  return handler(request);
}
