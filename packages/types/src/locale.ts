/**
 * Supported locale codes for the MyClup platform.
 * Turkish is the primary locale; English is the default fallback.
 */
export type SupportedLocale = 'tr' | 'en';

export const SUPPORTED_LOCALES: readonly SupportedLocale[] = ['tr', 'en'] as const;

export const DEFAULT_LOCALE: SupportedLocale = 'tr';

export const FALLBACK_LOCALE: SupportedLocale = 'en';

export interface LocaleConfig {
  defaultLocale: SupportedLocale;
  supportedLocales: readonly SupportedLocale[];
  fallbackLocale: SupportedLocale;
}
