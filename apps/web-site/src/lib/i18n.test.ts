import { describe, it, expect } from 'vitest';
import { i18nextResources, DEFAULT_LOCALE, SUPPORTED_LOCALES } from '@myclup/i18n';

/**
 * getRequestConfig loads messages from @myclup/i18n (i18nextResources).
 * We test the underlying message loading since getRequestConfig is server-only.
 */
describe('i18n message loading (getRequestConfig source)', () => {
  it('returns messages for tr locale', () => {
    const messages = i18nextResources.tr;
    expect(messages).toBeDefined();
    expect(messages.common).toBeDefined();
    expect(messages.auth).toBeDefined();
  });

  it('returns messages for en locale', () => {
    const messages = i18nextResources.en;
    expect(messages).toBeDefined();
    expect(messages.common).toBeDefined();
  });

  it('SUPPORTED_LOCALES includes tr and en', () => {
    expect(SUPPORTED_LOCALES).toContain('tr');
    expect(SUPPORTED_LOCALES).toContain('en');
  });

  it('DEFAULT_LOCALE is tr', () => {
    expect(DEFAULT_LOCALE).toBe('tr');
  });
});
