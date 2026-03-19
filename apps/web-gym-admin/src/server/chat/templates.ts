/**
 * Chat message templates server module.
 * Task 17.6, Issue #102
 *
 * List templates, send message using template. Locale-aware with fallback.
 * Validates tenant scope and conversation membership.
 *
 * ⚠️ SERVER-ONLY: Never import in client components or pages.
 */

import type { NextRequest } from 'next/server';
import type {
  ListTemplatesParams,
  ListTemplatesResponse,
  Message,
  MessageTemplate,
  SendTemplateInput,
} from '@myclup/contracts/chat';
import { ListTemplatesParamsSchema } from '@myclup/contracts/chat';
import { FALLBACK_LOCALE } from '@myclup/types';
import {
  getCurrentUser,
  createServerClient,
  resolveTenantScope,
  requirePermission,
  ForbiddenError,
  NotFoundError,
} from '@myclup/supabase';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

function getClient() {
  return createServerClient({
    supabaseUrl: SUPABASE_URL,
    serviceRoleKey: SERVICE_ROLE_KEY,
  });
}

/** Parse list templates params from query string. */
function parseListParams(req: NextRequest): ListTemplatesParams | null {
  const sp = req.nextUrl.searchParams;
  const gymId = sp.get('gymId');
  const locale = sp.get('locale');
  const branchId = sp.get('branchId');
  const parsed = ListTemplatesParamsSchema.safeParse({
    gymId: gymId ?? undefined,
    locale: locale === 'tr' || locale === 'en' ? locale : undefined,
    branchId: branchId === 'null' ? null : (branchId ?? undefined),
  });
  if (!parsed.success || !parsed.data.gymId) return null;
  return parsed.data;
}

/** Resolve template body for locale with fallback: requested → default → fallback. */
function resolveTemplateBody(
  variants: Array<{ locale: string; body: string }>,
  defaultLocale: string,
  requestedLocale?: string
): { body: string; locale: string } {
  const tryLocale = (locale: string) => variants.find((v) => v.locale === locale)?.body ?? null;
  const body =
    (requestedLocale && tryLocale(requestedLocale)) ??
    tryLocale(defaultLocale) ??
    tryLocale(FALLBACK_LOCALE) ??
    variants[0]?.body ??
    '';
  const usedLocale =
    requestedLocale && tryLocale(requestedLocale)
      ? requestedLocale
      : tryLocale(defaultLocale)
        ? defaultLocale
        : tryLocale(FALLBACK_LOCALE)
          ? FALLBACK_LOCALE
          : (variants[0]?.locale ?? FALLBACK_LOCALE);
  return { body, locale: usedLocale };
}

/** Interpolate {{key}} placeholders in template body. */
function interpolateVariables(body: string, variables?: Record<string, string>): string {
  if (!variables || Object.keys(variables).length === 0) return body;
  return body.replace(/\{\{(\w+)\}\}/g, (_, key) => variables[key] ?? `{{${key}}}`);
}

/**
 * List message templates for a gym.
 * Validates user has gym access.
 */
export async function listTemplates(req: NextRequest): Promise<ListTemplatesResponse | null> {
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

  const { data: templateRows, error } = await client
    .from('message_templates')
    .select(
      `
      id,
      gym_id,
      branch_id,
      key,
      default_locale,
      created_at,
      updated_at,
      message_template_variants (locale, body)
    `
    )
    .eq('gym_id', params.gymId)
    .order('key', { ascending: true });

  if (error) {
    console.error('[chat/templates] list error:', error);
    throw new Error('Failed to list templates');
  }

  const locale = params.locale;
  const items: MessageTemplate[] = (templateRows ?? []).map((row: Record<string, unknown>) => {
    const variants =
      (row.message_template_variants as Array<{ locale: string; body: string }>) ?? [];
    const { body, locale: resolvedLocale } = resolveTemplateBody(
      variants,
      row.default_locale as string,
      locale
    );
    return {
      id: row.id as string,
      gymId: row.gym_id as string,
      branchId: row.branch_id as string | null,
      key: row.key as string,
      defaultLocale: row.default_locale as 'tr' | 'en',
      body,
      locale: resolvedLocale as 'tr' | 'en',
      variants: variants.map((v) => ({ locale: v.locale as 'tr' | 'en', body: v.body })),
      createdAt: row.created_at as string,
      updatedAt: row.updated_at as string,
    };
  });

  return { items };
}

/**
 * Send a message using a template.
 * Resolves template with locale fallback, interpolates variables, creates message.
 */
export async function sendTemplate(
  req: NextRequest,
  conversationId: string,
  input: SendTemplateInput
): Promise<Message | null> {
  const currentUser = await getCurrentUser(req);
  if (!currentUser) return null;
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) return null;

  const client = getClient();
  const userId = currentUser.user.id;

  const { data: participant } = await client
    .from('conversation_participants')
    .select('conversation_id')
    .eq('conversation_id', conversationId)
    .eq('user_id', userId)
    .single();

  if (!participant) {
    throw new ForbiddenError('Not a participant in this conversation');
  }

  const { data: conv } = await client
    .from('conversations')
    .select('gym_id')
    .eq('id', conversationId)
    .single();

  if (!conv) {
    throw new NotFoundError('Conversation not found');
  }

  const scopes = await resolveTenantScope(client, userId, conv.gym_id);
  if (scopes.length === 0) {
    throw new ForbiddenError('No access to this gym');
  }

  const { data: template, error: templateErr } = await client
    .from('message_templates')
    .select(
      `
      id,
      gym_id,
      default_locale,
      message_template_variants (locale, body)
    `
    )
    .eq('id', input.templateId)
    .eq('gym_id', conv.gym_id)
    .single();

  if (templateErr || !template) {
    throw new NotFoundError('Template not found or does not belong to this gym');
  }

  const t = template as unknown as {
    default_locale: string;
    message_template_variants?: Array<{ locale: string; body: string }>;
  };
  const variants = t.message_template_variants ?? [];
  const { body } = resolveTemplateBody(variants, t.default_locale, input.locale);
  const content = interpolateVariables(body, input.variables);

  const { data: existing } = await client
    .from('messages')
    .select('id, conversation_id, sender_id, content, dedupe_key, created_at')
    .eq('conversation_id', conversationId)
    .eq('dedupe_key', input.dedupeKey)
    .single();

  if (existing) {
    return {
      id: existing.id,
      conversationId: existing.conversation_id,
      senderId: existing.sender_id,
      content: existing.content,
      dedupeKey: existing.dedupe_key,
      createdAt: existing.created_at,
    };
  }

  const { data: inserted, error } = await client
    .from('messages')
    .insert({
      conversation_id: conversationId,
      sender_id: userId,
      content,
      dedupe_key: input.dedupeKey,
    })
    .select('id, conversation_id, sender_id, content, dedupe_key, created_at')
    .single();

  if (error) {
    if (error.code === '23505') {
      const { data: raceExisting } = await client
        .from('messages')
        .select('id, conversation_id, sender_id, content, dedupe_key, created_at')
        .eq('conversation_id', conversationId)
        .eq('dedupe_key', input.dedupeKey)
        .single();
      if (raceExisting) {
        return {
          id: raceExisting.id,
          conversationId: raceExisting.conversation_id,
          senderId: raceExisting.sender_id,
          content: raceExisting.content,
          dedupeKey: raceExisting.dedupe_key,
          createdAt: raceExisting.created_at,
        };
      }
    }
    console.error('[chat/templates] send error:', error);
    throw new Error('Failed to send template message');
  }

  return {
    id: inserted.id,
    conversationId: inserted.conversation_id,
    senderId: inserted.sender_id,
    content: inserted.content,
    dedupeKey: inserted.dedupe_key,
    createdAt: inserted.created_at,
  };
}
