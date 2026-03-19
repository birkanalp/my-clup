import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { PaymentHistoryList } from './PaymentHistoryList';
import { useMembership } from './useMembership';
import { usePaymentHistory } from './usePaymentHistory';

export function PaymentHistoryScreen() {
  const router = useRouter();
  const { t } = useTranslation('membership');
  const { data } = useMembership();
  const { error, items, loading } = usePaymentHistory();

  if (loading) {
    return (
      <View style={styles.centeredState}>
        <ActivityIndicator size="large" color="#0f766e" />
        <Text style={styles.stateText}>{t('state.loadingPayments')}</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centeredState}>
        <Text style={styles.stateText}>{t('state.errorPayments')}</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.content} style={styles.screen}>
      <PaymentHistoryList
        items={items}
        locale={data.locale}
        onSelectInvoice={(invoiceId) => router.push(`/membership/invoices/${invoiceId}`)}
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
