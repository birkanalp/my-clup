import { formatCurrency } from '@myclup/utils';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { PaymentHistoryItem } from './types';
import type { SupportedLocale } from '@myclup/types';
import { formatIsoDate } from './helpers';

interface PaymentHistoryListProps {
  items: PaymentHistoryItem[];
  locale: SupportedLocale;
  onSelectInvoice: (invoiceId: string) => void;
}

export function PaymentHistoryList({ items, locale, onSelectInvoice }: PaymentHistoryListProps) {
  const { t } = useTranslation('membership');

  if (items.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyText}>{t('message.noPayments')}</Text>
      </View>
    );
  }

  return (
    <View style={styles.list}>
      {items.map(({ payment, invoice }) => (
        <View key={payment.id} style={styles.card}>
          <View style={styles.headerRow}>
            <Text style={styles.amount}>
              {formatCurrency(payment.amount, locale, payment.currency)}
            </Text>
            <Text style={styles.status}>{t(`payment.status.${payment.status}`)}</Text>
          </View>
          <Text style={styles.meta}>
            {formatIsoDate(payment.paidAt ?? payment.createdAt, locale, t('label.notAvailable'))}
          </Text>
          <Text style={styles.meta}>{t(`payment.method.${payment.method}`)}</Text>
          {invoice ? (
            <Pressable
              accessibilityRole="button"
              onPress={() => onSelectInvoice(invoice.id)}
              style={styles.invoiceButton}
            >
              <Text style={styles.invoiceButtonText}>{t('cta.viewInvoice')}</Text>
            </Pressable>
          ) : null}
        </View>
      ))}
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
    gap: 8,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  amount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
  },
  status: {
    fontSize: 13,
    fontWeight: '700',
    color: '#155e75',
  },
  meta: {
    fontSize: 13,
    color: '#475569',
  },
  invoiceButton: {
    alignSelf: 'flex-start',
    marginTop: 4,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#0f766e',
  },
  invoiceButtonText: {
    color: '#ffffff',
    fontWeight: '700',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    color: '#475569',
    fontSize: 14,
  },
});
