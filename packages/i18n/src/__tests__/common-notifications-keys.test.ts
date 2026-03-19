import { describe, expect, it } from 'vitest';
import commonEn from '../namespaces/common/en.json';
import commonTr from '../namespaces/common/tr.json';

function flattenKeys(value: Record<string, unknown>, prefix = ''): string[] {
  return Object.entries(value).flatMap(([key, nestedValue]) => {
    const currentKey = prefix ? `${prefix}.${key}` : key;
    if (nestedValue && typeof nestedValue === 'object' && !Array.isArray(nestedValue)) {
      return flattenKeys(nestedValue as Record<string, unknown>, currentKey);
    }

    return [currentKey];
  });
}

describe('common notifications keys', () => {
  it('keeps notifications/reminder copy in parity across locales', () => {
    expect(flattenKeys({ notifications: commonTr.notifications } as Record<string, unknown>)).toEqual(
      flattenKeys({ notifications: commonEn.notifications } as Record<string, unknown>)
    );
  });
});
