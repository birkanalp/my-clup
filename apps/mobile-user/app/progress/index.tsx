import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Card, ScreenContainer } from '@myclup/ui-native';
import { AppText } from '../../src/components/AppText';
import { appTheme } from '../../src/theme/appTheme';

export default function ProgressScreen() {
  const { t } = useTranslation('common');

  return (
    <ScreenContainer style={styles.screen}>
      <View style={styles.header}>
        <AppText variant="title">{t('memberProgress.title')}</AppText>
        <AppText variant="subtitle" tone="muted" style={styles.subtitle}>
          {t('memberProgress.subtitle')}
        </AppText>
      </View>
      <Card style={styles.card}>
        <AppText variant="body" tone="muted">
          {t('memberProgress.body')}
        </AppText>
      </Card>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  header: {
    paddingHorizontal: appTheme.spacing.md,
    paddingBottom: appTheme.spacing.sm,
    gap: 4,
  },
  subtitle: {
    marginTop: 4,
  },
  card: {
    marginHorizontal: appTheme.spacing.md,
  },
});
