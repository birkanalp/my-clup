import { describe, expect, it } from 'vitest';
import commonEn from '../namespaces/common/en.json';
import commonTr from '../namespaces/common/tr.json';

const STAFF_PREFIXES = [
  'staffAuth',
  'staffTabs',
  'staffHome',
  'staffMembers',
  'staffAttendance',
  'staffWorkouts',
  'staffSales',
] as const;

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

describe('common staff mobile keys (en/tr parity)', () => {
  it('has matching key paths for staff* groups', () => {
    for (const group of STAFF_PREFIXES) {
      const enBranch = commonEn[group as keyof typeof commonEn] as Record<string, unknown> | undefined;
      const trBranch = commonTr[group as keyof typeof commonTr] as Record<string, unknown> | undefined;
      expect(enBranch, `${group} missing in en`).toBeDefined();
      expect(trBranch, `${group} missing in tr`).toBeDefined();
      const enKeys = keysDeep(enBranch!);
      const trKeys = keysDeep(trBranch!);
      expect(trKeys.sort()).toEqual(enKeys.sort());
    }
  });
});
