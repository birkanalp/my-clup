import { useState } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Button, Card, ScreenContainer } from '@myclup/ui-native';
import { supabase } from '../src/lib/supabase';
import { AppText } from '../src/components/AppText';
import { appTheme } from '../src/theme/appTheme';

export default function MemberSignInScreen() {
  const { t } = useTranslation('common');
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async () => {
    setError(null);
    if (!supabase) {
      setError(t('memberAuth.supabaseMissing'));
      return;
    }
    setBusy(true);
    try {
      const { error: signError } = await supabase.auth.signInWithPassword({ email, password });
      if (signError) {
        const isInvalidCredentials =
          signError.message.toLowerCase().includes('invalid') ||
          signError.message.toLowerCase().includes('credentials') ||
          signError.status === 400;
        setError(
          isInvalidCredentials
            ? t('memberAuth.error.invalidCredentials')
            : t('memberAuth.error.generic')
        );
        return;
      }
      router.replace('/');
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScreenContainer>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <View style={styles.container}>
          <Card style={styles.hero}>
            <AppText variant="eyebrow" tone="soft" style={styles.eyebrow}>
              {t('memberAuth.eyebrow')}
            </AppText>
            <AppText variant="title" style={styles.title}>
              {t('memberAuth.title')}
            </AppText>
            <AppText variant="body" tone="muted" style={styles.subtitle}>
              {t('memberAuth.subtitle')}
            </AppText>
          </Card>

          <Card>
            <AppText variant="label" style={styles.label}>
              {t('memberAuth.emailLabel')}
            </AppText>
            <TextInput
              accessibilityLabel={t('memberAuth.emailLabel')}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              placeholder={t('memberAuth.emailPlaceholder')}
              placeholderTextColor={appTheme.colors.textSoft}
              style={styles.input}
              editable={!busy}
            />
            <AppText variant="label" style={[styles.label, styles.labelSpaced]}>
              {t('memberAuth.passwordLabel')}
            </AppText>
            <TextInput
              accessibilityLabel={t('memberAuth.passwordLabel')}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholder={t('memberAuth.passwordPlaceholder')}
              placeholderTextColor={appTheme.colors.textSoft}
              style={styles.input}
              editable={!busy}
            />
            {error ? (
              <AppText variant="body" style={styles.error}>
                {error}
              </AppText>
            ) : null}
            <View style={styles.buttonRow}>
              {busy ? (
                <ActivityIndicator color={appTheme.colors.primary} />
              ) : (
                <Button onPress={() => void onSubmit()}>{t('memberAuth.signIn')}</Button>
              )}
            </View>
          </Card>
        </View>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: {
    flex: 1,
    gap: appTheme.spacing.md,
  },
  hero: {
    backgroundColor: appTheme.colors.text,
    gap: appTheme.spacing.sm,
  },
  eyebrow: {
    color: appTheme.colors.primarySoft,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  title: {
    color: '#f8fafc',
    fontSize: 24,
    fontWeight: '800',
  },
  subtitle: {
    color: '#cbd5e1',
    fontSize: 14,
    lineHeight: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: appTheme.colors.textMuted,
  },
  labelSpaced: { marginTop: appTheme.spacing.md },
  input: {
    marginTop: appTheme.spacing.xs,
    borderWidth: 1,
    borderColor: appTheme.colors.border,
    borderRadius: appTheme.radii.sm,
    paddingHorizontal: appTheme.spacing.md,
    paddingVertical: appTheme.spacing.sm,
    fontSize: 16,
    color: appTheme.colors.text,
    fontFamily: appTheme.fontFamily,
  },
  error: {
    marginTop: appTheme.spacing.md,
    color: appTheme.colors.dangerText,
    fontSize: 14,
  },
  buttonRow: {
    marginTop: appTheme.spacing.lg,
  },
});
