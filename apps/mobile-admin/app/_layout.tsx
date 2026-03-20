import { Slot } from 'expo-router';
import { I18nProvider } from '../src/providers/I18nProvider';
import { useDevAutoSignIn } from '../src/lib/useDevAutoSignIn';

export default function RootLayout() {
  useDevAutoSignIn();

  return (
    <I18nProvider>
      <Slot />
    </I18nProvider>
  );
}
