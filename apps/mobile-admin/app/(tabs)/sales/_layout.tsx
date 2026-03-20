import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';

export default function SalesLayout() {
  const { t } = useTranslation('common');

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerTitle: t('staffSales.title'),
      }}
    >
      <Stack.Screen name="index" options={{ title: t('staffSales.title') }} />
    </Stack>
  );
}
