/**
 * Platform-wide read models (service role). Caller must enforce requirePlatformOperator first.
 */
import type {
  PlatformAuditListResponse,
  PlatformBillingSummaryResponse,
  PlatformConversationsSummaryResponse,
  PlatformGymsListResponse,
  PlatformLocalesSummaryResponse,
  PlatformMembershipsSummaryResponse,
  PlatformUsersListResponse,
} from '@myclup/contracts';
import { getPlatformServiceClient } from '@/src/server/platform/service-client';

function emptyGyms(): PlatformGymsListResponse {
  return { gyms: [] };
}

export async function listPlatformGyms(): Promise<PlatformGymsListResponse> {
  const service = getPlatformServiceClient();
  if (!service) return emptyGyms();

  const { data, error } = await service
    .from('gyms')
    .select('id, name, slug, is_active, is_published, city, country, created_at')
    .order('name', { ascending: true })
    .limit(200);

  if (error || !data) return emptyGyms();

  return {
    gyms: data.map((g) => ({
      id: g.id,
      name: g.name,
      slug: g.slug,
      is_active: g.is_active,
      is_published: g.is_published,
      city: g.city,
      country: g.country,
      created_at: g.created_at,
    })),
  };
}

export async function listPlatformUsersWithRoles(): Promise<PlatformUsersListResponse> {
  const service = getPlatformServiceClient();
  if (!service) return { users: [] };

  const { data: profiles, error: pErr } = await service
    .from('profiles')
    .select('user_id, display_name, locale')
    .order('display_name', { ascending: true })
    .limit(200);

  if (pErr || !profiles?.length) return { users: [] };

  const ids = profiles.map((p) => p.user_id);
  const { data: roles, error: rErr } = await service
    .from('user_role_assignments')
    .select('user_id, role, gym_id')
    .in('user_id', ids);

  if (rErr) return { users: [] };

  const byUser = new Map<string, { role: string; gym_id: string | null }[]>();
  for (const row of roles ?? []) {
    const list = byUser.get(row.user_id) ?? [];
    list.push({ role: row.role, gym_id: row.gym_id });
    byUser.set(row.user_id, list);
  }

  return {
    users: profiles.map((p) => ({
      user_id: p.user_id,
      display_name: p.display_name,
      locale: p.locale,
      roles: byUser.get(p.user_id) ?? [],
    })),
  };
}

export async function listRecentAuditEvents(): Promise<PlatformAuditListResponse> {
  const service = getPlatformServiceClient();
  if (!service) return { events: [] };

  const { data, error } = await service
    .from('audit_events')
    .select('id, event_type, actor_id, target_type, target_id, created_at')
    .order('created_at', { ascending: false })
    .limit(100);

  if (error || !data) return { events: [] };

  return {
    events: data.map((e) => ({
      id: e.id,
      event_type: e.event_type,
      actor_id: e.actor_id,
      target_type: e.target_type,
      target_id: e.target_id,
      created_at: e.created_at,
    })),
  };
}

async function countWhere(
  table: 'invoices' | 'membership_instances' | 'conversations',
  filter?: { column: string; value: string },
): Promise<number> {
  const service = getPlatformServiceClient();
  if (!service) return 0;
  let q = service.from(table).select('*', { count: 'exact', head: true });
  if (filter) {
    q = q.eq(filter.column, filter.value);
  }
  const { count, error } = await q;
  if (error || count === null) return 0;
  return count;
}

export async function getPlatformBillingSummary(): Promise<PlatformBillingSummaryResponse> {
  const service = getPlatformServiceClient();
  if (!service) {
    return { invoices_total: 0, invoices_open: 0, invoices_paid: 0 };
  }

  const total = await countWhere('invoices');
  const open = await countWhere('invoices', { column: 'status', value: 'open' });
  const paid = await countWhere('invoices', { column: 'status', value: 'paid' });

  return {
    invoices_total: total,
    invoices_open: open,
    invoices_paid: paid,
  };
}

export async function getPlatformMembershipsSummary(): Promise<PlatformMembershipsSummaryResponse> {
  const service = getPlatformServiceClient();
  if (!service) {
    return { instances_total: 0, instances_active: 0, instances_cancelled: 0 };
  }

  const total = await countWhere('membership_instances');
  const active = await countWhere('membership_instances', { column: 'status', value: 'active' });
  const cancelled = await countWhere('membership_instances', {
    column: 'status',
    value: 'cancelled',
  });

  return {
    instances_total: total,
    instances_active: active,
    instances_cancelled: cancelled,
  };
}

export async function getPlatformLocalesSummary(): Promise<PlatformLocalesSummaryResponse> {
  const service = getPlatformServiceClient();
  if (!service) return { locales: [] };

  const { data, error } = await service.from('profiles').select('locale').limit(2000);

  if (error || !data) return { locales: [] };

  const counts = new Map<string, number>();
  for (const row of data) {
    counts.set(row.locale, (counts.get(row.locale) ?? 0) + 1);
  }

  return {
    locales: [...counts.entries()]
      .map(([locale, count]) => ({ locale, count }))
      .sort((a, b) => b.count - a.count),
  };
}

export async function getPlatformConversationsSummary(): Promise<PlatformConversationsSummaryResponse> {
  const total = await countWhere('conversations');
  return { conversations_total: total };
}
