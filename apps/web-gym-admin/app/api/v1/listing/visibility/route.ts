import { updateListingVisibilityContract } from '@myclup/contracts/listing';
import { withAuthContractRoute } from '@/src/lib/withAuthContractRoute';
import * as listingServer from '@/src/server/listing';

export const PATCH = withAuthContractRoute(updateListingVisibilityContract, async (req, input) => {
  if (!input) return null;
  return listingServer.updateGymListingVisibility(req, input);
});
