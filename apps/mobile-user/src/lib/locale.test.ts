/**
 * Unit tests for locale detection — device locale mapped to SupportedLocale.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as Localization from 'expo-localization';
import { detectDeviceLocale } from './locale';

vi.mock('expo-localization', () => ({
  getLocales: vi.fn(),
}));

describe('detectDeviceLocale', () => {
  beforeEach(() => {
    vi.mocked(Localization.getLocales).mockClear();
  });

  it('maps "tr-TR" to "tr"', () => {
    vi.mocked(Localization.getLocales).mockReturnValue([
      { languageTag: 'tr-TR', languageCode: 'tr' } as Localization.Locale,
    ]);
    expect(detectDeviceLocale()).toBe('tr');
  });

  it('maps "en-US" to "en"', () => {
    vi.mocked(Localization.getLocales).mockReturnValue([
      { languageTag: 'en-US', languageCode: 'en' } as Localization.Locale,
    ]);
    expect(detectDeviceLocale()).toBe('en');
  });

  it('falls back to DEFAULT_LOCALE (tr) for unsupported "de-DE"', () => {
    vi.mocked(Localization.getLocales).mockReturnValue([
      { languageTag: 'de-DE', languageCode: 'de' } as Localization.Locale,
    ]);
    expect(detectDeviceLocale()).toBe('tr');
  });

  it('uses languageCode when available', () => {
    vi.mocked(Localization.getLocales).mockReturnValue([
      { languageTag: 'tr-TR', languageCode: 'tr' } as Localization.Locale,
    ]);
    expect(detectDeviceLocale()).toBe('tr');
  });

  it('extracts base from languageTag when languageCode not valid', () => {
    vi.mocked(Localization.getLocales).mockReturnValue([
      { languageTag: 'en-GB' } as Localization.Locale,
    ]);
    expect(detectDeviceLocale()).toBe('en');
  });

  it('returns DEFAULT_LOCALE when locales empty', () => {
    vi.mocked(Localization.getLocales).mockReturnValue([]);
    expect(detectDeviceLocale()).toBe('tr');
  });
});
