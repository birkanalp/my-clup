import { useState } from 'react';
import {
  View,
  Text,
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

export default function StaffSignInScreen() {
  const { t } = useTranslation('common');
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async () => {
    setError(null);
    if (!supabase) {
      setError(t('staffAuth.supabaseMissing'));
      return;
    }
    setBusy(true);
    try {
      const { error: signError } = await supabase.auth.signInWithPassword({ email, password });
      if (signError) {
        setError(signError.message);
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
            <Text style={styles.eyebrow}>{t('staffAuth.eyebrow')}</Text>
            <Text style={styles.title}>{t('staffAuth.title')}</Text>
            <Text style={styles.subtitle}>{t('staffAuth.subtitle')}</Text>
          </Card>

          <Card>
            <Text style={styles.label}>{t('staffAuth.emailLabel')}</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              placeholder={t('staffAuth.emailPlaceholder')}
              style={styles.input}
              editable={!busy}
            />
            <Text style={[styles.label, styles.labelSpaced]}>{t('staffAuth.passwordLabel')}</Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholder={t('staffAuth.passwordPlaceholder')}
              style={styles.input}
              editable={!busy}
            />
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <View style={styles.buttonRow}>
              {busy ? (
                <ActivityIndicator />
              ) : (
                <Button onPress={() => void onSubmit()}>{t('staffAuth.signIn')}</Button>
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
    gap: 16,
  },
  hero: {
    backgroundColor: '#0f172a',
  },
  eyebrow: {
    color: '#5eead4',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  title: {
    marginTop: 10,
    color: '#f8fafc',
    fontSize: 24,
    fontWeight: '800',
  },
  subtitle: {
    marginTop: 8,
    color: '#cbd5e1',
    fontSize: 14,
    lineHeight: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
  },
  labelSpaced: { marginTop: 12 },
  input: {
    marginTop: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#0f172a',
  },
  error: {
    marginTop: 12,
    color: '#b91c1c',
    fontSize: 14,
  },
  buttonRow: {
    marginTop: 20,
  },
});
