import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';

export default function MembersLayout() {
  const { t } = useTranslation('common');

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerTitle: t('staffMembers.stackTitle'),
      }}
    >
      <Stack.Screen name="index" options={{ title: t('staffMembers.stackTitle') }} />
      <Stack.Screen name="attendance" options={{ title: t('staffAttendance.title') }} />
    </Stack>
  );
}
