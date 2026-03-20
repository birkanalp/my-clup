import { useTranslation } from 'react-i18next';
import { View, Text, StyleSheet } from 'react-native';
import { Card, ScreenContainer, SectionHeader } from '@myclup/ui-native';

export default function WorkoutsScreen() {
  const { t } = useTranslation('common');

  return (
    <ScreenContainer>
      <View style={styles.container}>
        <Card>
          <SectionHeader title={t('staffWorkouts.title')} subtitle={t('staffWorkouts.subtitle')} />
          <Text style={styles.body}>{t('staffWorkouts.placeholder')}</Text>
        </Card>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, gap: 16 },
  body: {
    marginTop: 12,
    color: '#64748b',
    fontSize: 15,
    lineHeight: 22,
  },
});
