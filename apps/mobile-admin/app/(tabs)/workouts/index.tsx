import { useTranslation } from 'react-i18next';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { Card, ScreenContainer, SectionHeader } from '@myclup/ui-native';

type TemplateRow = { id: string; titleKey: string; duration: string; focusKey: string };

const TEMPLATE_ROWS: TemplateRow[] = [
  { id: 'a', titleKey: 'staffWorkouts.templateA', duration: '45 min', focusKey: 'staffWorkouts.focusLower' },
  { id: 'b', titleKey: 'staffWorkouts.templateB', duration: '20 min', focusKey: 'staffWorkouts.focusConditioning' },
  { id: 'c', titleKey: 'staffWorkouts.templateC', duration: '15 min', focusKey: 'staffWorkouts.focusRecovery' },
];

export default function WorkoutsScreen() {
  const { t } = useTranslation('common');

  return (
    <ScreenContainer>
      <View style={styles.container}>
        <Card>
          <SectionHeader title={t('staffWorkouts.title')} subtitle={t('staffWorkouts.subtitle')} />
          <Text style={styles.body}>{t('staffWorkouts.placeholder')}</Text>
        </Card>

        <Card>
          <SectionHeader
            title={t('staffWorkouts.templatesTitle')}
            subtitle={t('staffWorkouts.templatesSubtitle')}
          />
          <FlatList
            data={TEMPLATE_ROWS}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <View style={styles.row}>
                <Text style={styles.rowTitle}>{t(item.titleKey)}</Text>
                <Text style={styles.rowMeta}>
                  {t('staffWorkouts.templateMeta', {
                    duration: item.duration,
                    focus: t(item.focusKey),
                  })}
                </Text>
              </View>
            )}
          />
        </Card>

        <Card>
          <SectionHeader title={t('staffWorkouts.quickLogTitle')} subtitle="" />
          <Text style={styles.body}>{t('staffWorkouts.quickLogBody')}</Text>
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
  row: {
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e2e8f0',
  },
  rowTitle: { fontSize: 16, fontWeight: '600', color: '#0f172a' },
  rowMeta: { fontSize: 13, color: '#64748b', marginTop: 4 },
});
