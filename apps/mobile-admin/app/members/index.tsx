import { useTranslation } from 'react-i18next';
import { View, Text, StyleSheet } from 'react-native';
import { ScreenContainer, Card, SectionHeader } from '@myclup/ui-native';

export default function MembersWorkspaceScreen() {
  const { t } = useTranslation('membership');

  return (
    <ScreenContainer>
      <View style={styles.container}>
        <Card>
          <SectionHeader
            title={t('gymAdmin.staff.title')}
            subtitle={t('gymAdmin.staff.subtitle')}
          />
          <Text style={styles.placeholder}>{t('gymAdmin.staff.placeholder')}</Text>
        </Card>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 16,
  },
  placeholder: {
    marginTop: 12,
    color: '#64748b',
    fontSize: 15,
    lineHeight: 22,
  },
});
