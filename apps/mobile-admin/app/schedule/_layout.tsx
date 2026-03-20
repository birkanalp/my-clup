import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';

export default function ScheduleLayout() {
  const { t } = useTranslation('common');

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerTitle: t('scheduleWorkspace.heroTitle'),
      }}
    >
      <Stack.Screen name="index" options={{ title: t('scheduleWorkspace.heroTitle') }} />
    </Stack>
  );
}
