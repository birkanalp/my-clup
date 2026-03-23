import type { ContactLeadRequest } from '@myclup/contracts';
import { contactLeadContract } from '@myclup/contracts';
import * as contactLeadServer from '@/server/contact-lead';
import { withContractRoute } from '@/lib/withContractRoute';

export const POST = withContractRoute(contactLeadContract, async (body) => {
  if (!body) {
    return { ok: false as const, error: 'validation_error' };
  }
  return contactLeadServer.persistContactLead(body as ContactLeadRequest);
});
