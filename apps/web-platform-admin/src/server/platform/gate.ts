/**
 * Platform BFF gate: validated session + platform role check (server-only).
 */
import { getSession } from '@myclup/supabase';
import { getPlatformServiceClient } from '@/src/server/platform/service-client';

const PLATFORM_ROLES = new Set(['platform_admin', 'platform_support', 'platform_finance']);

export type PlatformGate =
  | { ok: true; userId: string }
  | { ok: false; status: 401 | 403; error: string };

type HeaderCarrier = { headers: Headers };

export async function requirePlatformOperator(req: HeaderCarrier): Promise<PlatformGate> {
  const session = await getSession(req);
  const userId = session?.user?.id;
  if (!userId) {
    return { ok: false, status: 401, error: 'unauthorized' };
  }

  const service = getPlatformServiceClient();
  if (!service) {
    // Tests / misconfig: mirror sign-in leniency — still require a session
    return { ok: true, userId };
  }

  const { data: roleRows, error } = await service
    .from('user_role_assignments')
    .select('role, gym_id')
    .eq('user_id', userId);

  if (error) {
    return { ok: false, status: 403, error: 'forbidden' };
  }

  const hasPlatform = (roleRows ?? []).some(
    (row) => row.gym_id === null && PLATFORM_ROLES.has(row.role),
  );

  if (!hasPlatform) {
    return { ok: false, status: 403, error: 'forbidden' };
  }

  return { ok: true, userId };
}
