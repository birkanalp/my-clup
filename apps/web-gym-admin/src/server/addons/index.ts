import type { NextRequest } from 'next/server';
import type { ListAddonsResponse } from '@myclup/contracts/addons';
import { AddonPackageIdSchema } from '@myclup/contracts/addons';
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

const ALL_PACKAGES = AddonPackageIdSchema.options;

export async function listAddons(req: NextRequest): Promise<ListAddonsResponse | null> {
  const currentUser = await getCurrentUser(req);
  if (!currentUser) return null;
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) return null;

  const client = getClient();
  const scopes = await resolveTenantScope(client, currentUser.user.id);
  if (scopes.length === 0) throw new ForbiddenError('No tenant scope for addons list');

  const scope = scopes[0];
  await requirePermission(client, currentUser.user.id, scope, 'members:read');

  const { data: entitlements, error } = await client
    .from('addon_entitlements')
    .select('package_id, status, activated_at')
    .eq('gym_id', scope.gymId);

  if (error) throw new Error(`listAddons failed: ${error.message}`);

  const entitlementMap = new Map<string, { status: string; activatedAt: string | null }>();
  for (const row of entitlements ?? []) {
    entitlementMap.set(row.package_id as string, {
      status: row.status as string,
      activatedAt: (row.activated_at as string | null) ?? null,
    });
  }

  const items = ALL_PACKAGES.map((packageId) => {
    const entitlement = entitlementMap.get(packageId);
    return {
      packageId,
      status: (entitlement?.status ?? 'inactive') as 'inactive' | 'active' | 'suspended',
      activatedAt: entitlement?.activatedAt ?? null,
      usageStats: null,
    };
  });

  return { items };
}
