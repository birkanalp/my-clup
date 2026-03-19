import { formatDate, parseISODate } from '@myclup/utils';
import type { MembershipInstance, MembershipPlan } from '@myclup/api-client';
import type { SupportedLocale } from '@myclup/types';

const MEMBERSHIP_STATUS_PRIORITY: Record<MembershipInstance['status'], number> = {
  active: 0,
  frozen: 1,
  expired: 2,
  cancelled: 3,
};

export function resolveSupportedLocale(language?: string): SupportedLocale {
  return language === 'tr' ? 'tr' : 'en';
}

export function pickPreferredMembership(
  items: MembershipInstance[]
): MembershipInstance | null {
  return (
    [...items].sort((left, right) => {
      const priorityDifference =
        MEMBERSHIP_STATUS_PRIORITY[left.status] - MEMBERSHIP_STATUS_PRIORITY[right.status];
      if (priorityDifference !== 0) {
        return priorityDifference;
      }

      return new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime();
    })[0] ?? null
  );
}

export function isExpiringSoon(validUntil: string | null, days = 7): boolean {
  if (!validUntil) {
    return false;
  }

  const validUntilDate = new Date(validUntil);
  const now = Date.now();
  const threshold = now + days * 24 * 60 * 60 * 1000;
  return validUntilDate.getTime() >= now && validUntilDate.getTime() <= threshold;
}

export function calculateRenewalDates(
  membership: MembershipInstance,
  plan: MembershipPlan
): { renewedUntil: string; addedSessions: number | null } {
  const now = new Date();
  const membershipEndDate = membership.validUntil ? new Date(membership.validUntil) : now;
  const baseDate = membershipEndDate.getTime() > now.getTime() ? membershipEndDate : now;
  const renewedUntilDate = new Date(baseDate);

  if (plan.durationDays) {
    renewedUntilDate.setUTCDate(renewedUntilDate.getUTCDate() + plan.durationDays);
  }

  return {
    renewedUntil: renewedUntilDate.toISOString(),
    addedSessions: plan.sessionCount ?? null,
  };
}

export function formatIsoDate(
  value: string | null | undefined,
  locale: SupportedLocale,
  fallback: string
): string {
  const parsedValue = parseISODate(value);
  return parsedValue ? formatDate(parsedValue, locale) : fallback;
}
