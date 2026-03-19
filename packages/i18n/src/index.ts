/**
 * @myclup/i18n — Shared translation core for MyClup.
 *
 * Framework-agnostic. No React, Expo, or Next.js dependencies.
 * Use in server, BFF, or any Node context.
 */
export type { SupportedLocale } from '@myclup/types';
export { FALLBACK_LOCALE, DEFAULT_LOCALE, SUPPORTED_LOCALES } from '@myclup/types';

export { t, type TranslateParams, type TranslationNamespace } from './translate';
export { i18nextResources } from './resources';
