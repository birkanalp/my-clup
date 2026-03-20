/**
 * Locale validation helpers — runtime foundation for locale handling across packages.
 */
import { DEFAULT_LOCALE, SUPPORTED_LOCALES, type SupportedLocale } from '@myclup/types';

/**
 * Supported locales from `@myclup/types` (readonly snapshot).
 */
export function getSupportedLocales(): readonly SupportedLocale[] {
  return SUPPORTED_LOCALES;
}

/**
 * Platform default locale from `@myclup/types`.
 */
export function getDefaultLocale(): SupportedLocale {
  return DEFAULT_LOCALE;
}

/**
 * Check if a value is a valid SupportedLocale (type guard).
 */
export function isValidLocale(value: unknown): value is SupportedLocale {
  return typeof value === 'string' && (SUPPORTED_LOCALES as readonly string[]).includes(value);
}
