import { describe, expect, it } from 'vitest';
import { LocaleCodeSchema, LocalePreferenceSchema } from './locale';

describe('LocaleCodeSchema', () => {
  it('parses supported locales', () => {
    expect(LocaleCodeSchema.parse('tr')).toBe('tr');
    expect(LocaleCodeSchema.parse('en')).toBe('en');
  });

  it('rejects unknown locale', () => {
    expect(LocaleCodeSchema.safeParse('de').success).toBe(false);
  });
});

describe('LocalePreferenceSchema', () => {
  it('accepts locale only', () => {
    expect(LocalePreferenceSchema.parse({ locale: 'en' })).toEqual({ locale: 'en' });
  });

  it('accepts locale with fallback', () => {
    expect(LocalePreferenceSchema.parse({ locale: 'tr', fallbackLocale: 'en' })).toEqual({
      locale: 'tr',
      fallbackLocale: 'en',
    });
  });

  it('rejects invalid fallback', () => {
    expect(LocalePreferenceSchema.safeParse({ locale: 'en', fallbackLocale: 'xx' }).success).toBe(
      false
    );
  });
});
