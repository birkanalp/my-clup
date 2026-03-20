import { describe, expect, it } from 'vitest';
import { getDefaultLocale, getSupportedLocales, isValidLocale } from './locale';

describe('getSupportedLocales', () => {
  it('returns a non-empty readonly array matching platform locales', () => {
    const locales = getSupportedLocales();
    expect(locales.length).toBeGreaterThan(0);
    expect(locales).toContain('tr');
    expect(locales).toContain('en');
  });
});

describe('getDefaultLocale', () => {
  it('returns a value present in getSupportedLocales', () => {
    const def = getDefaultLocale();
    expect(getSupportedLocales().includes(def)).toBe(true);
  });
});

describe('isValidLocale', () => {
  it('returns true for known locales', () => {
    expect(isValidLocale('tr')).toBe(true);
    expect(isValidLocale('en')).toBe(true);
  });

  it('returns false for unknown strings', () => {
    expect(isValidLocale('de')).toBe(false);
    expect(isValidLocale('')).toBe(false);
    expect(isValidLocale(null)).toBe(false);
  });

  it('narrows type in TypeScript branches', () => {
    const value: unknown = 'tr';
    if (isValidLocale(value)) {
      const locale = value;
      expect(locale).toBe('tr');
    }
  });
});
