import { useCallback, useEffect, useMemo, useState } from 'react';
import type { MembershipPlan } from '@myclup/api-client';
import { useTranslation } from 'react-i18next';
import { api } from '../../lib/api';
import { useCurrentUser } from '../chat/useCurrentUser';
import {
  calculateRenewalDates,
  isExpiringSoon,
  pickPreferredMembership,
  resolveSupportedLocale,
} from './helpers';
import type { MembershipScreenData, RenewalReason, RenewalSubmissionResult } from './types';

function determineRenewalReason(validUntil: string | null): RenewalReason {
  if (!validUntil) {
    return null;
  }

  const expiryDate = new Date(validUntil).getTime();
  if (expiryDate < Date.now()) {
    return 'expired';
  }

  return isExpiringSoon(validUntil) ? 'expiring_soon' : null;
}

export function useMembership() {
  const memberId = useCurrentUser();
  const { i18n } = useTranslation('membership');
  const locale = useMemo(
    () => resolveSupportedLocale(i18n.resolvedLanguage),
    [i18n.resolvedLanguage]
  );
  const [data, setData] = useState<MembershipScreenData>({
    locale,
    memberId,
    membership: null,
    plan: null,
    renewalOptions: [],
    canRenew: false,
    renewalReason: null,
  });
  const [loading, setLoading] = useState(true);
  const [renewing, setRenewing] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(async () => {
    if (!memberId) {
      setData({
        locale,
        memberId,
        membership: null,
        plan: null,
        renewalOptions: [],
        canRenew: false,
        renewalReason: null,
      });
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const listResult = await api.membership.listMembershipInstances({
        memberId,
        limit: 20,
      });
      const selectedMembership = pickPreferredMembership(listResult.items);

      if (!selectedMembership) {
        setData({
          locale,
          memberId,
          membership: null,
          plan: null,
          renewalOptions: [],
          canRenew: false,
          renewalReason: null,
        });
        return;
      }

      const membership = await api.membership.getMembershipInstance(selectedMembership.id);
      const plansResult = await api.membership.listMembershipPlans({
        gymId: membership.gymId,
        branchId: membership.branchId ?? undefined,
      });
      const plan = plansResult.items.find((item) => item.id === membership.planId) ?? null;
      const renewalReason = determineRenewalReason(membership.validUntil);

      setData({
        locale,
        memberId,
        membership,
        plan,
        renewalOptions: plansResult.items.filter((item) => item.status === 'active'),
        canRenew: renewalReason !== null,
        renewalReason,
      });
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError : new Error(String(loadError)));
      setData({
        locale,
        memberId,
        membership: null,
        plan: null,
        renewalOptions: [],
        canRenew: false,
        renewalReason: null,
      });
    } finally {
      setLoading(false);
    }
  }, [locale, memberId]);

  useEffect(() => {
    void load();
  }, [load]);

  const renewMembership = useCallback(
    async (planId: string): Promise<RenewalSubmissionResult> => {
      if (!data.membership) {
        throw new Error('membership_not_loaded');
      }

      const selectedPlan = data.renewalOptions.find((item) => item.id === planId);
      if (!selectedPlan) {
        throw new Error('renewal_plan_not_found');
      }

      setRenewing(true);
      try {
        const { renewedUntil, addedSessions } = calculateRenewalDates(
          data.membership,
          selectedPlan
        );
        const result = await api.membership.renewMembership(data.membership.id, {
          membershipInstanceId: data.membership.id,
          renewedUntil,
          addedSessionCount: addedSessions ?? undefined,
        });

        setData((currentValue) => ({
          ...currentValue,
          membership: result.membership,
          plan:
            currentValue.plan && currentValue.plan.id === selectedPlan.id
              ? currentValue.plan
              : selectedPlan,
          canRenew: false,
          renewalReason: null,
        }));

        return {
          membership: result.membership,
          plan: selectedPlan,
          renewedUntil,
          addedSessions,
        };
      } finally {
        setRenewing(false);
      }
    },
    [data.membership, data.plan, data.renewalOptions]
  );

  const selectedRenewalPlan = useMemo<MembershipPlan | null>(() => {
    if (!data.plan) {
      return data.renewalOptions[0] ?? null;
    }

    return (
      data.renewalOptions.find((item) => item.id === data.plan?.id) ??
      data.renewalOptions[0] ??
      null
    );
  }, [data.plan, data.renewalOptions]);

  return {
    data,
    error,
    loading,
    refresh: load,
    renewMembership,
    renewing,
    selectedRenewalPlan,
  };
}
