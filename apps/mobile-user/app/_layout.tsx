import { useEffect } from 'react';
import { Manrope_400Regular, useFonts } from '@expo-google-fonts/manrope';
import { Slot, useRouter, useSegments } from 'expo-router';
import { I18nProvider } from '../src/providers/I18nProvider';
import { AppShell } from '../src/components/AppShell';
import { useDevAutoSignIn } from '../src/lib/useDevAutoSignIn';
import { useAuthSession } from '../src/lib/useAuthSession';

function AuthGate({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuthSession();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (loading) {
      return;
    }

    const onSignInScreen = segments[0] === 'sign-in';

    if (!session && !onSignInScreen) {
      router.replace('/sign-in');
    } else if (session && onSignInScreen) {
      router.replace('/');
    }
  }, [session, loading, segments, router]);

  if (loading) {
    return null;
  }

  return <>{children}</>;
}

function AppContent() {
  const segments = useSegments();
  const onSignInScreen = segments[0] === 'sign-in';

  if (onSignInScreen) {
    return <Slot />;
  }

  return (
    <AppShell>
      <Slot />
    </AppShell>
  );
}

export default function RootLayout() {
  useDevAutoSignIn();

  const [fontsLoaded] = useFonts({
    Manrope_400Regular,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <I18nProvider>
      <AuthGate>
        <AppContent />
      </AuthGate>
    </I18nProvider>
  );
}
