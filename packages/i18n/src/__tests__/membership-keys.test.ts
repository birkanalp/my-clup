import { describe, expect, it } from 'vitest';
import membershipEn from '../namespaces/membership/en.json';
import membershipTr from '../namespaces/membership/tr.json';

function flattenKeys(value: Record<string, unknown>, prefix = ''): string[] {
  return Object.entries(value).flatMap(([key, nestedValue]) => {
    const currentKey = prefix ? `${prefix}.${key}` : key;
    if (nestedValue && typeof nestedValue === 'object' && !Array.isArray(nestedValue)) {
      return flattenKeys(nestedValue as Record<string, unknown>, currentKey);
    }

    return [currentKey];
  });
}

describe('membership translation keys', () => {
  it('keeps en and tr namespaces in parity', () => {
    expect(flattenKeys(membershipTr)).toEqual(flattenKeys(membershipEn));
  });
});
