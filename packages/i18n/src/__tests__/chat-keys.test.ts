import { describe, expect, it } from 'vitest';
import chatEn from '../namespaces/chat/en.json';
import chatTr from '../namespaces/chat/tr.json';

function flattenKeys(value: Record<string, unknown>, prefix = ''): string[] {
  return Object.entries(value).flatMap(([key, nestedValue]) => {
    const currentKey = prefix ? `${prefix}.${key}` : key;
    if (nestedValue && typeof nestedValue === 'object' && !Array.isArray(nestedValue)) {
      return flattenKeys(nestedValue as Record<string, unknown>, currentKey);
    }

    return [currentKey];
  });
}

describe('chat locale keys', () => {
  it('keeps chat copy in parity across locales', () => {
    expect(flattenKeys(chatTr as Record<string, unknown>)).toEqual(
      flattenKeys(chatEn as Record<string, unknown>)
    );
  });
});
