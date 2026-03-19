import { Manrope_400Regular, useFonts } from '@expo-google-fonts/manrope';
import { Slot } from 'expo-router';
import { I18nProvider } from '../src/providers/I18nProvider';
import { AppShell } from '../src/components/AppShell';

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Manrope_400Regular,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <I18nProvider>
      <AppShell>
        <Slot />
      </AppShell>
    </I18nProvider>
  );
}
