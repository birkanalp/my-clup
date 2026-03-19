/**
 * Locale detection: device locale → SupportedLocale.
 * Uses expo-localization and isValidLocale from @myclup/utils.
 */
import * as Localization from 'expo-localization';
import { DEFAULT_LOCALE, type SupportedLocale } from '@myclup/types';
import { isValidLocale } from '@myclup/utils';

/**
 * Map device locale to SupportedLocale.
 * "tr-TR", "tr" → "tr"; "en-US", "en" → "en"; unsupported → DEFAULT_LOCALE.
 */
export function detectDeviceLocale(): SupportedLocale {
  const deviceLocales = Localization.getLocales();
  const firstCode = deviceLocales[0]?.languageCode ?? deviceLocales[0]?.languageTag;
  if (firstCode && isValidLocale(firstCode)) {
    return firstCode as SupportedLocale;
  }
  // Try language tag (e.g. "tr-TR") — extract base language
  const tag = deviceLocales[0]?.languageTag;
  if (tag) {
    const base = tag.split('-')[0];
    if (base && isValidLocale(base)) {
      return base as SupportedLocale;
    }
  }
  return DEFAULT_LOCALE;
}
