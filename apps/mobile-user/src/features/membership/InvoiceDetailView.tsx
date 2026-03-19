import { formatCurrency } from '@myclup/utils';
import type { Invoice } from '@myclup/api-client';
import type { SupportedLocale } from '@myclup/types';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { formatIsoDate } from './helpers';

interface InvoiceDetailViewProps {
  invoice: Invoice;
  locale: SupportedLocale;
  onShare: () => void;
}

export function InvoiceDetailView({ invoice, locale, onShare }: InvoiceDetailViewProps) {
  const { t } = useTranslation('membership');

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <Text style={styles.label}>{t('label.invoiceStatus')}</Text>
        <Text style={styles.value}>{t(`invoice.status.${invoice.status}`)}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>{t('label.issuedAt')}</Text>
        <Text style={styles.value}>
          {formatIsoDate(invoice.issuedAt, locale, t('label.notAvailable'))}
        </Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>{t('label.dueAt')}</Text>
        <Text style={styles.value}>
          {formatIsoDate(invoice.dueAt, locale, t('label.notAvailable'))}
        </Text>
      </View>
      {invoice.paidAt ? (
        <View style={styles.row}>
          <Text style={styles.label}>{t('label.paidAt')}</Text>
          <Text style={styles.value}>
            {formatIsoDate(invoice.paidAt, locale, t('label.notAvailable'))}
          </Text>
        </View>
      ) : null}

      <View style={styles.lineItems}>
        <Text style={styles.sectionTitle}>{t('label.lineItems')}</Text>
        {invoice.lineItems.map((item) => (
          <View key={item.id} style={styles.lineItemRow}>
            <Text style={styles.lineItemLabel}>
              {item.label} x{item.quantity}
            </Text>
            <Text style={styles.value}>
              {formatCurrency(item.totalAmount, locale, invoice.currency)}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.totalBlock}>
        <View style={styles.row}>
          <Text style={styles.label}>{t('label.subtotal')}</Text>
          <Text style={styles.value}>
            {formatCurrency(invoice.subtotalAmount, locale, invoice.currency)}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>{t('label.discount')}</Text>
          <Text style={styles.value}>
            {formatCurrency(invoice.discountAmount, locale, invoice.currency)}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.totalLabel}>{t('label.total')}</Text>
          <Text style={styles.totalValue}>
            {formatCurrency(invoice.totalAmount, locale, invoice.currency)}
          </Text>
        </View>
      </View>

      <Pressable accessibilityRole="button" onPress={onShare} style={styles.shareButton}>
        <Text style={styles.shareButtonText}>{t('cta.shareInvoice')}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    gap: 14,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  label: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '600',
  },
  value: {
    flex: 1,
    textAlign: 'right',
    fontSize: 14,
    color: '#0f172a',
    fontWeight: '600',
  },
  lineItems: {
    gap: 10,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0f172a',
  },
  lineItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  lineItemLabel: {
    flex: 1,
    fontSize: 14,
    color: '#334155',
  },
  totalBlock: {
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 14,
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  shareButton: {
    borderRadius: 999,
    backgroundColor: '#0f766e',
    paddingHorizontal: 18,
    paddingVertical: 12,
    alignItems: 'center',
  },
  shareButtonText: {
    color: '#ffffff',
    fontWeight: '700',
  },
});
