/**
 * Chat quick replies server module.
 * Task 17.6, Issue #102
 *
 * List quick replies. Locale-aware with fallback.
 * Validates tenant scope.
 *
 * ⚠️ SERVER-ONLY: Never import in client components or pages.
 */

import type { NextRequest } from 'next/server';
import type {
  ListQuickRepliesParams,
  ListQuickRepliesResponse,
  QuickReply,
} from '@myclup/contracts/chat';
import { ListQuickRepliesParamsSchema } from '@myclup/contracts/chat';
import { FALLBACK_LOCALE } from '@myclup/types';
import {
  getCurrentUser,
  createServerClient,
  resolveTenantScope,
  requirePermission,
  ForbiddenError,
} from '@myclup/supabase';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

function getClient() {
  return createServerClient({
    supabaseUrl: SUPABASE_URL,
    serviceRoleKey: SERVICE_ROLE_KEY,
  });
}

/** Parse list quick replies params from query string. */
function parseListParams(req: NextRequest): ListQuickRepliesParams | null {
  const sp = req.nextUrl.searchParams;
  const gymId = sp.get('gymId');
  const locale = sp.get('locale');
  const branchId = sp.get('branchId');
  const parsed = ListQuickRepliesParamsSchema.safeParse({
    gymId: gymId ?? undefined,
    locale: locale === 'tr' || locale === 'en' ? locale : undefined,
    branchId: branchId === 'null' ? null : (branchId ?? undefined),
  });
  if (!parsed.success || !parsed.data.gymId) return null;
  return parsed.data;
}

/** Resolve quick reply variant for locale with fallback. */
function resolveVariant(
  variants: Array<{ locale: string; label: string; body: string }>,
  defaultLocale: string,
  requestedLocale?: string
): { label: string; body: string; locale: string } {
  const tryLocale = (locale: string) => variants.find((v) => v.locale === locale) ?? null;
  const v =
    (requestedLocale && tryLocale(requestedLocale)) ??
    tryLocale(defaultLocale) ??
    tryLocale(FALLBACK_LOCALE) ??
    variants[0];
  if (!v) {
    return { label: '', body: '', locale: FALLBACK_LOCALE };
  }
  const usedLocale =
    requestedLocale && tryLocale(requestedLocale)
      ? requestedLocale
      : tryLocale(defaultLocale)
        ? defaultLocale
        : tryLocale(FALLBACK_LOCALE)
          ? FALLBACK_LOCALE
          : v.locale;
  return { label: v.label, body: v.body, locale: usedLocale };
}

/**
 * List quick replies for a gym.
 * Validates user has gym access.
 */
export async function listQuickReplies(req: NextRequest): Promise<ListQuickRepliesResponse | null> {
  const currentUser = await getCurrentUser(req);
  if (!currentUser) return null;
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) return null;

  const params = parseListParams(req);
  if (!params) {
    throw new ForbiddenError('Missing required gymId parameter');
  }

  const client = getClient();
  const userId = currentUser.user.id;

  const scopes = await resolveTenantScope(client, userId, params.gymId);
  if (scopes.length === 0) {
    throw new ForbiddenError('No access to the specified gym');
  }
  await requirePermission(
    client,
    userId,
    { gymId: params.gymId, branchId: params.branchId ?? null },
    'chat:read'
  );

  const { data: rows, error } = await client
    .from('quick_replies')
    .select(
      `
      id,
      gym_id,
      branch_id,
      key,
      default_locale,
      sort_order,
      created_at,
      updated_at,
      quick_reply_variants (locale, label, body)
    `
    )
    .eq('gym_id', params.gymId)
    .order('sort_order', { ascending: true })
    .order('key', { ascending: true });

  if (error) {
    console.error('[chat/quick-replies] list error:', error);
    throw new Error('Failed to list quick replies');
  }

  const locale = params.locale;
  const items: QuickReply[] = (rows ?? []).map((row: Record<string, unknown>) => {
    const variants =
      (row.quick_reply_variants as Array<{ locale: string; label: string; body: string }>) ?? [];
    const {
      label,
      body,
      locale: resolvedLocale,
    } = resolveVariant(variants, row.default_locale as string, locale);
    return {
      id: row.id as string,
      gymId: row.gym_id as string,
      branchId: row.branch_id as string | null,
      key: row.key as string,
      defaultLocale: row.default_locale as 'tr' | 'en',
      label,
      body,
      locale: resolvedLocale as 'tr' | 'en',
      sortOrder: row.sort_order as number,
      variants: variants.map((v) => ({
        locale: v.locale as 'tr' | 'en',
        label: v.label,
        body: v.body,
      })),
      createdAt: row.created_at as string,
      updatedAt: row.updated_at as string,
    };
  });

  return { items };
}
