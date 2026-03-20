import { describe, expect, it } from 'vitest';
import commonEn from '../namespaces/common/en.json';
import commonTr from '../namespaces/common/tr.json';

function flattenKeys(value: Record<string, unknown>, prefix = ''): string[] {
  return Object.entries(value).flatMap(([key, nested]) => {
    const current = prefix ? `${prefix}.${key}` : key;
    if (nested && typeof nested === 'object' && !Array.isArray(nested)) {
      return flattenKeys(nested as Record<string, unknown>, current);
    }
    return [current];
  });
}

describe('common scheduling keys', () => {
  it('keeps admin shell and scheduling copy in parity across locales', () => {
    const branches = ['adminShell', 'scheduleWorkspace'];
    const enKeys = branches.flatMap((branch) =>
      flattenKeys({ [branch]: commonEn[branch as keyof typeof commonEn] } as Record<
        string,
        unknown
      >)
    );
    const trKeys = branches.flatMap((branch) =>
      flattenKeys({ [branch]: commonTr[branch as keyof typeof commonTr] } as Record<
        string,
        unknown
      >)
    );

    expect(trKeys).toEqual(enKeys);
  });
});
