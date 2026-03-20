import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';

export default function MembersLayout() {
  const { t } = useTranslation('membership');

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerTitle: t('gymAdmin.staff.title'),
      }}
    >
      <Stack.Screen name="index" options={{ title: t('gymAdmin.staff.title') }} />
    </Stack>
  );
}
