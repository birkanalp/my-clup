import type { NextRequest } from 'next/server';
import type {
  CreateCampaignRequest,
  CreateCampaignResponse,
  ListCampaignsResponse,
  SendCampaignResponse,
} from '@myclup/contracts/campaigns';
import {
  createServerClient,
  ForbiddenError,
  getCurrentUser,
  requirePermission,
  resolveTenantScope,
} from '@myclup/supabase';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

function getClient() {
  return createServerClient({
    supabaseUrl: SUPABASE_URL,
    serviceRoleKey: SERVICE_ROLE_KEY,
  });
}

export async function listCampaigns(req: NextRequest): Promise<ListCampaignsResponse | null> {
  const currentUser = await getCurrentUser(req);
  if (!currentUser) return null;
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) return null;

  const sp = req.nextUrl.searchParams;
  const gymId = sp.get('gymId') ?? undefined;
  const cursor = sp.get('cursor') ?? undefined;
  const limitParam = sp.get('limit');
  const limit =
    limitParam && Number.isFinite(Number.parseInt(limitParam, 10))
      ? Number.parseInt(limitParam, 10)
      : 20;

  const client = getClient();
  const scopes = await resolveTenantScope(client, currentUser.user.id, gymId);
  if (scopes.length === 0) throw new ForbiddenError('No tenant scope for campaigns list');

  const scope = scopes[0];
  await requirePermission(client, currentUser.user.id, scope, 'members:read');

  let query = client
    .from('campaigns')
    .select(
      'id, gym_id, title, message_body, target_segment, status, sent_at, delivery_count, created_at, updated_at',
      { count: 'exact' }
    )
    .eq('gym_id', scope.gymId)
    .order('created_at', { ascending: false });

  if (cursor) {
    query = query.lt('created_at', cursor);
  }

  const { data, error, count } = await query.limit(limit);
  if (error) throw new Error(`listCampaigns failed: ${error.message}`);

  const rows = data ?? [];
  const items = rows.map((row) => ({
    id: row.id as string,
    gymId: row.gym_id as string,
    title: row.title as string,
    messageBody: row.message_body as string,
    targetSegment: row.target_segment as 'all_members' | 'expiring_soon' | 'inactive',
    status: row.status as 'draft' | 'sent' | 'failed',
    sentAt: (row.sent_at as string | null) ?? null,
    deliveryCount: (row.delivery_count as number | null) ?? null,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  }));

  const nextCursor = rows.length === limit ? (rows[rows.length - 1]?.created_at ?? null) : null;

  return { items, nextCursor, total: count ?? rows.length };
}

export async function createCampaign(
  req: NextRequest,
  input: CreateCampaignRequest
): Promise<CreateCampaignResponse | null> {
  const currentUser = await getCurrentUser(req);
  if (!currentUser) return null;
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) return null;

  const client = getClient();
  const scopes = await resolveTenantScope(client, currentUser.user.id, input.gymId);
  if (scopes.length === 0) throw new ForbiddenError('No tenant scope for campaign create');

  const scope = scopes[0];
  await requirePermission(client, currentUser.user.id, scope, 'members:write');

  const now = new Date().toISOString();
  const { data, error } = await client
    .from('campaigns')
    .insert({
      gym_id: scope.gymId,
      title: input.title,
      message_body: input.messageBody,
      target_segment: input.targetSegment,
      status: 'draft',
      sent_at: null,
      delivery_count: null,
      created_at: now,
      updated_at: now,
    })
    .select(
      'id, gym_id, title, message_body, target_segment, status, sent_at, delivery_count, created_at, updated_at'
    )
    .single();

  if (error) throw new Error(`createCampaign failed: ${error.message}`);

  return {
    id: data.id as string,
    gymId: data.gym_id as string,
    title: data.title as string,
    messageBody: data.message_body as string,
    targetSegment: data.target_segment as 'all_members' | 'expiring_soon' | 'inactive',
    status: 'draft' as const,
    sentAt: null,
    deliveryCount: null,
    createdAt: data.created_at as string,
    updatedAt: data.updated_at as string,
  };
}

export async function sendCampaign(
  req: NextRequest,
  campaignId: string
): Promise<SendCampaignResponse | null> {
  const currentUser = await getCurrentUser(req);
  if (!currentUser) return null;
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) return null;

  const client = getClient();

  const { data: campaign, error: fetchError } = await client
    .from('campaigns')
    .select('id, gym_id, target_segment, status')
    .eq('id', campaignId)
    .maybeSingle();

  if (fetchError) throw new Error(`sendCampaign fetch failed: ${fetchError.message}`);
  if (!campaign) {
    const { NotFoundError } = await import('@myclup/supabase');
    throw new NotFoundError('Campaign not found');
  }

  const scopes = await resolveTenantScope(client, currentUser.user.id, campaign.gym_id as string);
  if (scopes.length === 0) throw new ForbiddenError('No tenant scope for campaign send');

  const scope = scopes[0];
  await requirePermission(client, currentUser.user.id, scope, 'members:write');

  if ((campaign.gym_id as string) !== scope.gymId) {
    throw new ForbiddenError('Campaign does not belong to your gym');
  }

  // Compute delivery count by segment
  let deliveryCount = 0;
  if (campaign.target_segment === 'all_members') {
    const { count } = await client
      .from('membership_instances')
      .select('id', { count: 'exact', head: true })
      .eq('gym_id', scope.gymId)
      .eq('status', 'active');
    deliveryCount = count ?? 0;
  } else if (campaign.target_segment === 'expiring_soon') {
    const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    const { count } = await client
      .from('membership_instances')
      .select('id', { count: 'exact', head: true })
      .eq('gym_id', scope.gymId)
      .eq('status', 'active')
      .lte('valid_until', thirtyDaysFromNow);
    deliveryCount = count ?? 0;
  } else if (campaign.target_segment === 'inactive') {
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
    const { count } = await client
      .from('membership_instances')
      .select('id', { count: 'exact', head: true })
      .eq('gym_id', scope.gymId)
      .lt('updated_at', ninetyDaysAgo)
      .neq('status', 'active');
    deliveryCount = count ?? 0;
  }

  const sentAt = new Date().toISOString();
  const { error: updateError } = await client
    .from('campaigns')
    .update({ status: 'sent', sent_at: sentAt, delivery_count: deliveryCount, updated_at: sentAt })
    .eq('id', campaignId);

  if (updateError) throw new Error(`sendCampaign update failed: ${updateError.message}`);

  return {
    id: campaignId,
    status: 'sent' as const,
    deliveryCount,
    sentAt,
  };
}
