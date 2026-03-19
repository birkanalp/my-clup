/**
 * Locale validation helpers.
 */
import { SUPPORTED_LOCALES, type SupportedLocale } from '@myclup/types';

/**
 * Check if a value is a valid SupportedLocale.
 */
export function isValidLocale(value: unknown): value is SupportedLocale {
  return typeof value === 'string' && (SUPPORTED_LOCALES as readonly string[]).includes(value);
}
