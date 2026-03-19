import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';

export default function MembershipLayout() {
  const { t } = useTranslation('membership');

  return (
    <Stack screenOptions={{ headerShown: true }}>
      <Stack.Screen name="index" options={{ headerShown: false, title: t('nav.overview') }} />
      <Stack.Screen name="renew" options={{ title: t('nav.renew') }} />
      <Stack.Screen name="payments" options={{ title: t('nav.payments') }} />
      <Stack.Screen name="confirm" options={{ title: t('nav.confirmation') }} />
      <Stack.Screen name="invoices/[id]" options={{ title: t('nav.invoiceDetail') }} />
    </Stack>
  );
}
