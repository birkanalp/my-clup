import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';

export default function BookingLayout() {
  const { t } = useTranslation('common');

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerTitle: t('memberBooking.title'),
      }}
    >
      <Stack.Screen name="index" options={{ title: t('memberBooking.title') }} />
    </Stack>
  );
}
