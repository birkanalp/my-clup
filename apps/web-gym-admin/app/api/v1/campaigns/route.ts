import { listCampaignsContract, createCampaignContract } from '@myclup/contracts/campaigns';
import { withAuthContractRoute } from '@/src/lib/withAuthContractRoute';
import * as campaignsServer from '@/src/server/campaigns';

export const GET = withAuthContractRoute(listCampaignsContract, async (req) =>
  campaignsServer.listCampaigns(req)
);

export const POST = withAuthContractRoute(createCampaignContract, async (req, input) => {
  if (!input) return null;
  return campaignsServer.createCampaign(req, input);
});
