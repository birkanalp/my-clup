import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';

export default function WorkoutsLayout() {
  const { t } = useTranslation('common');

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerTitle: t('staffWorkouts.title'),
      }}
    >
      <Stack.Screen name="index" options={{ title: t('staffWorkouts.title') }} />
    </Stack>
  );
}
