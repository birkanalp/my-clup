import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';

export default function DiscoveryLayout() {
  const { t } = useTranslation('common');

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerTitle: t('memberDiscovery.title'),
      }}
    >
      <Stack.Screen name="index" options={{ title: t('memberDiscovery.title') }} />
    </Stack>
  );
}
