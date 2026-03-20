import { describe, expect, it } from 'vitest';
import commonEn from '../namespaces/common/en.json';
import commonTr from '../namespaces/common/tr.json';

function keysDeep(obj: Record<string, unknown>, prefix = ''): string[] {
  const out: string[] = [];
  for (const [k, v] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      out.push(...keysDeep(v as Record<string, unknown>, path));
    } else {
      out.push(path);
    }
  }
  return out;
}

describe('common publicSite keys (en/tr parity)', () => {
  it('matches nested keys between locales', () => {
    const enBranch = commonEn.publicSite as Record<string, unknown> | undefined;
    const trBranch = commonTr.publicSite as Record<string, unknown> | undefined;
    expect(enBranch).toBeDefined();
    expect(trBranch).toBeDefined();
    expect(keysDeep(trBranch!).sort()).toEqual(keysDeep(enBranch!).sort());
  });
});
