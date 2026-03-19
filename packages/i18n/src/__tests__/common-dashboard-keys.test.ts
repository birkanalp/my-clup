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

describe('common dashboard keys', () => {
  it('keeps shell and home dashboard copy in parity across locales', () => {
    const commonBranches = [
      'shell',
      'dashboard',
      'membershipDashboard',
      'messagesDashboard',
      'quickActions',
      'paymentsDashboard',
      'notificationsDashboard',
      'cta',
      'state',
    ];
    const enKeys = commonBranches.flatMap((branch) =>
      flattenKeys({ [branch]: commonEn[branch as keyof typeof commonEn] } as Record<
        string,
        unknown
      >)
    );
    const trKeys = commonBranches.flatMap((branch) =>
      flattenKeys({ [branch]: commonTr[branch as keyof typeof commonTr] } as Record<
        string,
        unknown
      >)
    );

    expect(trKeys).toEqual(enKeys);
  });
});
