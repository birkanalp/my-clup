import type { NextRequest } from 'next/server';
import { sendCampaignContract } from '@myclup/contracts/campaigns';
import { withAuthContractRoute } from '@/src/lib/withAuthContractRoute';
import * as campaignsServer from '@/src/server/campaigns';

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, context: RouteContext): Promise<Response> {
  const { id } = await context.params;
  return withAuthContractRoute(sendCampaignContract, async (request) =>
    campaignsServer.sendCampaign(request, id)
  )(req);
}
