import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { formatNumber } from '@myclup/utils';
import { RenewalOptionsList } from './RenewalOptionsList';
import { useMembership } from './useMembership';
import { calculateRenewalDates, formatIsoDate } from './helpers';

export function RenewMembershipScreen() {
  const router = useRouter();
  const { t } = useTranslation('membership');
  const { data, error, loading, renewMembership, renewing, refresh } = useMembership();
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);

  const selectedPlan =
    data.renewalOptions.find((plan) => plan.id === selectedPlanId) ?? data.renewalOptions[0] ?? null;
  const preview = useMemo(() => {
    if (!data.membership || !selectedPlan) {
      return null;
    }

    return calculateRenewalDates(data.membership, selectedPlan);
  }, [data.membership, selectedPlan]);

  if (loading) {
    return (
      <View style={styles.centeredState}>
        <ActivityIndicator size="large" color="#0f766e" />
        <Text style={styles.stateText}>{t('state.loadingMembership')}</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centeredState}>
        <Text style={styles.stateText}>{t('state.errorMembership')}</Text>
        <Pressable accessibilityRole="button" onPress={() => void refresh()} style={styles.submitButton}>
          <Text style={styles.submitButtonText}>{t('cta.retry')}</Text>
        </Pressable>
      </View>
    );
  }

  if (!data.membership || data.renewalOptions.length === 0) {
    return (
      <View style={styles.centeredState}>
        <Text style={styles.stateText}>{t('message.noMembership')}</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.content} style={styles.screen}>
      <Text style={styles.helper}>{t('renewal.helper')}</Text>
      <RenewalOptionsList
        locale={data.locale}
        onSelect={setSelectedPlanId}
        plans={data.renewalOptions}
        selectedPlanId={selectedPlan?.id ?? null}
      />

      {selectedPlan && preview ? (
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>{t('label.renewalSummary')}</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>{t('renewal.selected')}</Text>
            <Text style={styles.summaryValue}>{selectedPlan.name}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>{t('renewal.newValidity')}</Text>
            <Text style={styles.summaryValue}>
              {formatIsoDate(preview.renewedUntil, data.locale, t('label.notAvailable'))}
            </Text>
          </View>
          {preview.addedSessions !== null ? (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>{t('renewal.addedSessions')}</Text>
              <Text style={styles.summaryValue}>
                {formatNumber(preview.addedSessions, data.locale)}
              </Text>
            </View>
          ) : null}
        </View>
      ) : null}

      <Pressable
        accessibilityRole="button"
        disabled={!selectedPlan || renewing}
        onPress={async () => {
          if (!selectedPlan) {
            return;
          }

          const result = await renewMembership(selectedPlan.id);
          router.replace({
            pathname: '/membership/confirm',
            params: {
              planName: result.plan.name,
              renewedUntil: result.renewedUntil,
              addedSessions: result.addedSessions !== null ? String(result.addedSessions) : '',
            },
          });
        }}
        style={[styles.submitButton, renewing ? styles.submitButtonDisabled : null]}
      >
        <Text style={styles.submitButtonText}>
          {renewing ? t('state.submittingRenewal') : t('cta.submitRenewal')}
        </Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    padding: 20,
    gap: 18,
  },
  helper: {
    fontSize: 14,
    lineHeight: 21,
    color: '#475569',
  },
  centeredState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 24,
    backgroundColor: '#f8fafc',
  },
  stateText: {
    color: '#475569',
    textAlign: 'center',
  },
  summaryCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 18,
    gap: 12,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  summaryLabel: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '600',
  },
  summaryValue: {
    flex: 1,
    textAlign: 'right',
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
  },
  submitButton: {
    borderRadius: 999,
    backgroundColor: '#0f766e',
    paddingVertical: 14,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#ffffff',
    fontWeight: '700',
    textAlign: 'center',
  },
});
