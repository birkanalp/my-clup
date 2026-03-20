import { useTranslation } from 'react-i18next';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Button, Card, LanguageSwitcher, ScreenContainer, SectionHeader } from '@myclup/ui-native';
import { changeLanguageAndPersist } from '../src/lib/i18n';

export default function HomeScreen() {
  const { t } = useTranslation(['common', 'chat']);
  const router = useRouter();

  return (
    <ScreenContainer>
      <View style={styles.container}>
        <Card style={styles.heroCard}>
          <Text style={styles.eyebrow}>{t('common:adminShell.eyebrow')}</Text>
          <Text style={styles.title}>{t('common:adminShell.title')}</Text>
          <Text style={styles.subtitle}>{t('common:adminShell.subtitle')}</Text>
        </Card>

        <Card>
          <SectionHeader
            title={t('common:adminShell.schedule')}
            subtitle={t('common:scheduleWorkspace.heroSubtitle')}
          />
          <View style={styles.buttonRow}>
            <Button onPress={() => router.push('/schedule')}>
              {t('common:adminShell.schedule')}
            </Button>
          </View>
        </Card>

        <Card>
          <SectionHeader
            title={t('chat:nav.chatCenter')}
            subtitle={t('common:adminShell.chatSubtitle')}
          />
          <View style={styles.buttonRow}>
            <Button variant="secondary" onPress={() => router.push('/chat')}>
              {t('chat:nav.chatCenter')}
            </Button>
          </View>
        </Card>

        <Card>
          <SectionHeader
            title={t('membership:gymAdmin.staff.title')}
            subtitle={t('membership:gymAdmin.staff.subtitle')}
          />
          <View style={styles.buttonRow}>
            <Button variant="secondary" onPress={() => router.push('/members')}>
              {t('membership:gymAdmin.staff.openAction')}
            </Button>
          </View>
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
  buttonRow: {
    marginTop: 16,
  },
});
