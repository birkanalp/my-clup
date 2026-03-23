import { getListingContract, updateListingContract } from '@myclup/contracts/listing';
import { withAuthContractRoute } from '@/src/lib/withAuthContractRoute';
import * as listingServer from '@/src/server/listing';

export const GET = withAuthContractRoute(getListingContract, async (req) =>
  listingServer.getGymListing(req)
);

export const PATCH = withAuthContractRoute(updateListingContract, async (req, input) => {
  if (!input) return null;
  return listingServer.updateGymListing(req, input);
});
