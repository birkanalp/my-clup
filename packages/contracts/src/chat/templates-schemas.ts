/**
 * Message template and quick-reply schemas.
 * Task 17.6, Issue #102
 *
 * Locale-aware variants; templates and quick replies in separate tables from raw messages.
 * Per .cursor/rules/chat-first-realtime-safety.mdc
 */
import { z } from 'zod';
import { SUPPORTED_LOCALES, type SupportedLocale } from '@myclup/types';

const supportedLocaleEnum = z.enum(
  SUPPORTED_LOCALES as unknown as [SupportedLocale, ...SupportedLocale[]]
);

// --- Message Templates ---

/** Locale variant for a message template. */
export const MessageTemplateVariantSchema = z.object({
  locale: supportedLocaleEnum,
  body: z.string(),
});
export type MessageTemplateVariant = z.infer<typeof MessageTemplateVariantSchema>;

/** Message template entity (with resolved variant for requested locale). */
export const MessageTemplateSchema = z.object({
  id: z.string().uuid(),
  gymId: z.string().uuid(),
  branchId: z.string().uuid().nullable(),
  key: z.string().min(1).max(128),
  defaultLocale: supportedLocaleEnum,
  /** Resolved body for the requested locale (fallback: defaultLocale → fallback). */
  body: z.string(),
  /** Locale of the resolved body. */
  locale: supportedLocaleEnum,
  variants: z.array(MessageTemplateVariantSchema).optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type MessageTemplate = z.infer<typeof MessageTemplateSchema>;

/** Input: List templates query params. */
export const ListTemplatesParamsSchema = z.object({
  gymId: z.string().uuid(),
  locale: supportedLocaleEnum.optional(),
  branchId: z.string().uuid().nullable().optional(),
});
export type ListTemplatesParams = z.infer<typeof ListTemplatesParamsSchema>;

/** Input: Send message using template. */
export const SendTemplateInputSchema = z.object({
  templateId: z.string().uuid(),
  locale: supportedLocaleEnum.optional(),
  /** Variable substitution: {{name}} → variables.name */
  variables: z.record(z.string()).optional(),
  dedupeKey: z.string().min(1),
});
export type SendTemplateInput = z.infer<typeof SendTemplateInputSchema>;

/** List templates response. */
export const ListTemplatesResponseSchema = z.object({
  items: z.array(MessageTemplateSchema),
});
export type ListTemplatesResponse = z.infer<typeof ListTemplatesResponseSchema>;

// --- Quick Replies ---

/** Locale variant for a quick reply. */
export const QuickReplyVariantSchema = z.object({
  locale: supportedLocaleEnum,
  label: z.string(),
  body: z.string(),
});
export type QuickReplyVariant = z.infer<typeof QuickReplyVariantSchema>;

/** Quick reply entity (with resolved variant for requested locale). */
export const QuickReplySchema = z.object({
  id: z.string().uuid(),
  gymId: z.string().uuid(),
  branchId: z.string().uuid().nullable(),
  key: z.string().min(1).max(128),
  defaultLocale: supportedLocaleEnum,
  /** Resolved label for the requested locale. */
  label: z.string(),
  /** Resolved body for the requested locale. */
  body: z.string(),
  /** Locale of the resolved variant. */
  locale: supportedLocaleEnum,
  sortOrder: z.number().int(),
  variants: z.array(QuickReplyVariantSchema).optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type QuickReply = z.infer<typeof QuickReplySchema>;

/** Input: List quick replies query params. */
export const ListQuickRepliesParamsSchema = z.object({
  gymId: z.string().uuid(),
  locale: supportedLocaleEnum.optional(),
  branchId: z.string().uuid().nullable().optional(),
});
export type ListQuickRepliesParams = z.infer<typeof ListQuickRepliesParamsSchema>;

/** List quick replies response. */
export const ListQuickRepliesResponseSchema = z.object({
  items: z.array(QuickReplySchema),
});
export type ListQuickRepliesResponse = z.infer<typeof ListQuickRepliesResponseSchema>;
