import { formatCurrency, formatNumber } from '@myclup/utils';
import type { MembershipPlan } from '@myclup/api-client';
import type { SupportedLocale } from '@myclup/types';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

interface RenewalOptionsListProps {
  locale: SupportedLocale;
  onSelect: (planId: string) => void;
  plans: MembershipPlan[];
  selectedPlanId: string | null;
}

export function RenewalOptionsList({
  locale,
  onSelect,
  plans,
  selectedPlanId,
}: RenewalOptionsListProps) {
  const { t } = useTranslation('membership');

  return (
    <View style={styles.list}>
      {plans.map((plan) => {
        const price = plan.pricingTiers[0];
        const isSelected = plan.id === selectedPlanId;

        return (
          <Pressable
            key={plan.id}
            accessibilityRole="button"
            onPress={() => onSelect(plan.id)}
            style={[styles.card, isSelected ? styles.cardSelected : null]}
          >
            <Text style={styles.planName}>{plan.name}</Text>
            <Text style={styles.planType}>{t(`type.${plan.type}`)}</Text>
            {price ? (
              <Text style={styles.price}>
                {formatCurrency(price.amount, locale, price.currency)}
              </Text>
            ) : null}
            {plan.sessionCount ? (
              <Text style={styles.meta}>
                {t('renewal.addedSessions')}: {formatNumber(plan.sessionCount, locale)}
              </Text>
            ) : null}
            {plan.durationDays ? (
              <Text style={styles.meta}>{t('label.dayCount', { count: plan.durationDays })}</Text>
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 12,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 16,
    gap: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  cardSelected: {
    borderColor: '#0f766e',
    backgroundColor: '#ecfeff',
  },
  planName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0f172a',
  },
  planType: {
    fontSize: 13,
    color: '#475569',
  },
  price: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f766e',
  },
  meta: {
    fontSize: 13,
    color: '#334155',
  },
});
