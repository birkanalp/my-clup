import type { NextRequest } from 'next/server';
import { getGymMemberContract } from '@myclup/contracts/members';
import { withAuthContractRoute } from '@/src/lib/withAuthContractRoute';
import * as membersServer from '@/src/server/members';

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const handler = withAuthContractRoute(getGymMemberContract, (req) =>
    membersServer.getMember(req, id)
  );
  return handler(request);
}
