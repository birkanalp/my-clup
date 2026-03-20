import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';

export default function ProgressLayout() {
  const { t } = useTranslation('common');

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerTitle: t('memberProgress.title'),
      }}
    >
      <Stack.Screen name="index" options={{ title: t('memberProgress.title') }} />
    </Stack>
  );
}
