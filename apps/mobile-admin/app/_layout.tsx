import { Slot } from 'expo-router';
import { I18nProvider } from '../src/providers/I18nProvider';

export default function RootLayout() {
  return (
    <I18nProvider>
      <Slot />
    </I18nProvider>
  );
}
