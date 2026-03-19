import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';

export default function ChatLayout() {
  const { t } = useTranslation('chat');

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerTitle: t('nav.chatCenter'),
      }}
    >
      <Stack.Screen name="index" options={{ title: t('nav.chatCenter') }} />
      <Stack.Screen name="[id]" options={{ title: t('list.title') }} />
    </Stack>
  );
}
