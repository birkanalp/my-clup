import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { formatIsoDate } from './helpers';
import { useMembership } from './useMembership';

export function RenewalConfirmationScreen() {
  const router = useRouter();
  const { t } = useTranslation('membership');
  const { data } = useMembership();
  const params = useLocalSearchParams<{
    addedSessions?: string;
    planName?: string;
    renewedUntil?: string;
  }>();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('message.renewalSuccess')}</Text>
      {params.planName ? (
        <Text style={styles.meta}>
          {t('renewal.selected')}: {params.planName}
        </Text>
      ) : null}
      {params.renewedUntil ? (
        <Text style={styles.meta}>
          {t('renewal.newValidity')}:{' '}
          {formatIsoDate(params.renewedUntil, data.locale, t('label.notAvailable'))}
        </Text>
      ) : null}
      {params.addedSessions ? (
        <Text style={styles.meta}>
          {t('renewal.addedSessions')}: {params.addedSessions}
        </Text>
      ) : null}
      <Pressable
        accessibilityRole="button"
        onPress={() => router.replace('/membership')}
        style={styles.button}
      >
        <Text style={styles.buttonText}>{t('cta.backToMembership')}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    padding: 24,
    gap: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0f172a',
  },
  meta: {
    fontSize: 15,
    color: '#475569',
  },
  button: {
    marginTop: 12,
    borderRadius: 999,
    backgroundColor: '#0f766e',
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: '700',
  },
});
