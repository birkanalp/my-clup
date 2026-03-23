/**
 * Persist public contact form submissions (server-only, service role).
 */
import type { ContactLeadRequest, ContactLeadResponse } from '@myclup/contracts';
import { createServerClient } from '@myclup/supabase';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';

export async function persistContactLead(body: ContactLeadRequest): Promise<ContactLeadResponse> {
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    return { ok: false, error: 'config_missing' };
  }

  const client = createServerClient({ supabaseUrl: SUPABASE_URL, serviceRoleKey: SERVICE_ROLE_KEY });

  const { data, error } = await client
    .from('marketing_leads')
    .insert({
      name: body.name,
      email: body.email,
      message: body.message ?? '',
      locale: body.locale,
      source: 'web_site_contact',
    })
    .select('id')
    .single();

  if (error || !data) {
    return { ok: false, error: 'persist_failed' };
  }

  return { ok: true, id: data.id };
}
