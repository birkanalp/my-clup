import { useTranslation } from 'react-i18next';
import { View, Text, StyleSheet } from 'react-native';
import { Card, LanguageSwitcher, ScreenContainer, SectionHeader } from '@myclup/ui-native';
import { changeLanguageAndPersist } from '../../src/lib/i18n';
import { useStaffWhoami } from '../../src/features/staff/useStaffWhoami';
import { useAuthSession } from '../../src/lib/useAuthSession';

export default function StaffHomeScreen() {
  const { t } = useTranslation('common');
  const { session } = useAuthSession();
  const { whoami, error } = useStaffWhoami(Boolean(session));

  return (
    <ScreenContainer>
      <View style={styles.container}>
        <Card style={styles.heroCard}>
          <Text style={styles.eyebrow}>{t('adminShell.eyebrow')}</Text>
          <Text style={styles.title}>{t('staffHome.title')}</Text>
          <Text style={styles.subtitle}>{t('staffHome.subtitle')}</Text>
          {whoami ? (
            <Text style={styles.roleLine}>
              {t('staffHome.signedInAs', { name: whoami.profile.displayName })}
            </Text>
          ) : null}
          {error ? <Text style={styles.warn}>{t('staffHome.whoamiWarning')}</Text> : null}
        </Card>

        <Card>
          <SectionHeader
            title={t('staffHome.quickSectionTitle')}
            subtitle={t('staffHome.quickSectionSubtitle')}
          />
          <Text style={styles.hint}>{t('staffHome.tabHint')}</Text>
        </Card>

        <LanguageSwitcher onLanguageChange={changeLanguageAndPersist} />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 16,
  },
  heroCard: {
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
    fontSize: 26,
    fontWeight: '800',
  },
  subtitle: {
    marginTop: 8,
    color: '#cbd5e1',
    fontSize: 15,
    lineHeight: 22,
  },
  roleLine: {
    marginTop: 12,
    color: '#e2e8f0',
    fontSize: 14,
  },
  warn: {
    marginTop: 10,
    color: '#fcd34d',
    fontSize: 13,
  },
  hint: {
    marginTop: 8,
    color: '#64748b',
    fontSize: 14,
    lineHeight: 20,
  },
});
