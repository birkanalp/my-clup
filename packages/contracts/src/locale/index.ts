/**
 * @myclup/contracts/locale — Locale request and content validation schemas.
 *
 * Used for API requests that accept locale (e.g. Accept-Language, query param)
 * and for localized content structures.
 */
import { z } from "zod";
import { SUPPORTED_LOCALES, type SupportedLocale } from "@myclup/types";

const supportedLocaleEnum = z.enum(
  SUPPORTED_LOCALES as unknown as [SupportedLocale, ...SupportedLocale[]]
);

/** Schema for request body containing explicit locale preference */
export const LocaleRequestSchema = z.object({
  locale: supportedLocaleEnum,
  fallbackLocale: supportedLocaleEnum.optional(),
});

/** Schema for locale query parameter (e.g. ?locale=en) */
export const LocaleQueryParamSchema = z.object({
  locale: supportedLocaleEnum.optional(),
});

export type LocaleRequest = z.infer<typeof LocaleRequestSchema>;
export type LocaleQueryParam = z.infer<typeof LocaleQueryParamSchema>;

/**
 * Content that has a value for each supported locale.
 * Use for required localized fields (e.g. gym name in tr and en).
 */
export type LocalizedContent<T> = Record<SupportedLocale, T>;

/**
 * Content that may have values for some locales only.
 * Use for optional localized fields or partial updates.
 */
export type PartialLocalizedContent<T> = Partial<Record<SupportedLocale, T>>;
