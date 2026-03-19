import { useMemo } from 'react';
import { ActivityIndicator, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { formatCurrency } from '@myclup/utils';
import { InvoiceDetailView } from './InvoiceDetailView';
import { formatIsoDate } from './helpers';
import { useMembership } from './useMembership';
import { usePaymentHistory } from './usePaymentHistory';

export function InvoiceDetailScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { t } = useTranslation('membership');
  const { data } = useMembership();
  const { findInvoiceById, loading } = usePaymentHistory();

  const invoice = useMemo(() => (id ? findInvoiceById(id) : null), [findInvoiceById, id]);

  if (loading) {
    return (
      <View style={styles.centeredState}>
        <ActivityIndicator size="large" color="#0f766e" />
        <Text style={styles.stateText}>{t('state.loadingPayments')}</Text>
      </View>
    );
  }

  if (!invoice) {
    return (
      <View style={styles.centeredState}>
        <Text style={styles.stateText}>{t('state.errorInvoice')}</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.content} style={styles.screen}>
      <InvoiceDetailView
        invoice={invoice}
        locale={data.locale}
        onShare={() =>
          void Share.share({
            message: `${t('message.invoiceShare', {
              invoiceId: invoice.id,
              amount: formatCurrency(invoice.totalAmount, data.locale, invoice.currency),
            })}\n${t('message.invoiceShareDetail', {
              status: t(`invoice.status.${invoice.status}`),
              issuedAt: formatIsoDate(invoice.issuedAt, data.locale, t('label.notAvailable')),
              amount: formatCurrency(invoice.totalAmount, data.locale, invoice.currency),
            })}`,
          })
        }
      />
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
  },
  centeredState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: '#f8fafc',
  },
  stateText: {
    color: '#475569',
    textAlign: 'center',
  },
});
