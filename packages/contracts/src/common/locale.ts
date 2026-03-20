import { z } from 'zod';
import { SUPPORTED_LOCALES, type SupportedLocale } from '@myclup/types';

const localeTuple = SUPPORTED_LOCALES as unknown as [SupportedLocale, ...SupportedLocale[]];

/** Single locale code — aligned with {@link SupportedLocale} in `@myclup/types`. */
export const LocaleCodeSchema = z.enum(localeTuple);

/** User-facing locale preference payload (API body fragments). */
export const LocalePreferenceSchema = z.object({
  locale: LocaleCodeSchema,
  fallbackLocale: LocaleCodeSchema.optional(),
});

export type LocalePreference = z.infer<typeof LocalePreferenceSchema>;
