import type { NextRequest } from 'next/server';
import type { ReportSummaryResponse } from '@myclup/contracts/reports';
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

export async function getReportSummary(req: NextRequest): Promise<ReportSummaryResponse | null> {
  const currentUser = await getCurrentUser(req);
  if (!currentUser) return null;
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) return null;

  const sp = req.nextUrl.searchParams;
  const from = sp.get('from');
  const to = sp.get('to');
  const gymId = sp.get('gymId') ?? undefined;

  if (!from || !to) {
    throw new Error('from and to query parameters are required');
  }

  const client = getClient();
  const scopes = await resolveTenantScope(client, currentUser.user.id, gymId);
  if (scopes.length === 0) throw new ForbiddenError('No tenant scope for reports');

  const scope = scopes[0];
  await requirePermission(client, currentUser.user.id, scope, 'payments:read');

  // Active members count
  const { count: activeCount } = await client
    .from('membership_instances')
    .select('id', { count: 'exact', head: true })
    .eq('gym_id', scope.gymId)
    .eq('status', 'active');

  // New members in period
  const { count: newCount } = await client
    .from('membership_instances')
    .select('id', { count: 'exact', head: true })
    .eq('gym_id', scope.gymId)
    .gte('created_at', from)
    .lte('created_at', to);

  // Expired in period
  const { count: expiredCount } = await client
    .from('membership_instances')
    .select('id', { count: 'exact', head: true })
    .eq('gym_id', scope.gymId)
    .eq('status', 'expired')
    .gte('updated_at', from)
    .lte('updated_at', to);

  // Revenue: sum of completed payments in period
  const { data: paymentsData } = await client
    .from('payments')
    .select('amount, status')
    .eq('gym_id', scope.gymId)
    .gte('created_at', from)
    .lte('created_at', to);

  const payments = paymentsData ?? [];
  const totalCollected = payments
    .filter((p) => p.status === 'succeeded')
    .reduce((sum, p) => sum + (p.amount as number), 0);
  const outstanding = payments
    .filter((p) => p.status === 'pending')
    .reduce((sum, p) => sum + (p.amount as number), 0);

  // Bookings stats
  const { data: sessionsData } = await client
    .from('booking_sessions')
    .select('id, booked_count, capacity')
    .eq('gym_id', scope.gymId)
    .gte('starts_at', from)
    .lte('starts_at', to);

  const sessions = sessionsData ?? [];
  const totalSessions = sessions.length;
  const avgAttendanceRate =
    totalSessions > 0
      ? sessions.reduce((sum, s) => {
          const cap = (s.capacity as number) || 1;
          return sum + Math.min((s.booked_count as number) / cap, 1);
        }, 0) / totalSessions
      : 0;

  return {
    revenue: {
      totalCollected,
      outstanding,
      currency: 'USD',
    },
    members: {
      activeCount: activeCount ?? 0,
      newThisPeriod: newCount ?? 0,
      expiredThisPeriod: expiredCount ?? 0,
    },
    bookings: {
      totalSessions,
      avgAttendanceRate: Math.round(avgAttendanceRate * 100) / 100,
    },
    periodFrom: from,
    periodTo: to,
  };
}
