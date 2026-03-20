import { describe, expect, it } from 'vitest';
import membershipEn from '../namespaces/membership/en.json';
import membershipTr from '../namespaces/membership/tr.json';

function flattenKeys(value: Record<string, unknown>, prefix = ''): string[] {
  return Object.entries(value).flatMap(([key, nested]) => {
    const current = prefix ? `${prefix}.${key}` : key;
    if (nested && typeof nested === 'object' && !Array.isArray(nested)) {
      return flattenKeys(nested as Record<string, unknown>, current);
    }
    return [current];
  });
}

describe('membership gymAdmin keys', () => {
  it('keeps gymAdmin branch in parity across locales', () => {
    const branch = 'gymAdmin';
    const enKeys = flattenKeys({
      [branch]: membershipEn[branch as keyof typeof membershipEn],
    } as Record<string, unknown>);
    const trKeys = flattenKeys({
      [branch]: membershipTr[branch as keyof typeof membershipTr],
    } as Record<string, unknown>);
    expect(trKeys).toEqual(enKeys);
  });
});
