import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View, Text, TextInput, StyleSheet, FlatList } from 'react-native';
import { Button, Card, ScreenContainer, SectionHeader } from '@myclup/ui-native';
import { loadStoredLeads, persistLeads, type StoredLead } from '@/src/features/staff/leadStorage';

export default function SalesLeadsScreen() {
  const { t } = useTranslation('common');
  const [name, setName] = useState('');
  const [source, setSource] = useState('');
  const [leads, setLeads] = useState<StoredLead[]>([]);

  useEffect(() => {
    void loadStoredLeads().then(setLeads);
  }, []);

  const addLead = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setLeads((prev) => {
      const next: StoredLead[] = [
        {
          id: `${Date.now()}`,
          name: trimmed,
          source: source.trim() || t('staffSales.sourceUnknown'),
        },
        ...prev,
      ];
      void persistLeads(next);
      return next;
    });
    setName('');
    setSource('');
  };

  return (
    <ScreenContainer>
      <View style={styles.container}>
        <Card>
          <SectionHeader title={t('staffSales.title')} subtitle={t('staffSales.subtitle')} />
          <Text style={styles.label}>{t('staffSales.leadName')}</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder={t('staffSales.leadNamePlaceholder')}
            style={styles.input}
          />
          <Text style={[styles.label, styles.spaced]}>{t('staffSales.leadSource')}</Text>
          <TextInput
            value={source}
            onChangeText={setSource}
            placeholder={t('staffSales.leadSourcePlaceholder')}
            style={styles.input}
          />
          <View style={styles.buttonRow}>
            <Button onPress={addLead}>{t('staffSales.capture')}</Button>
          </View>
        </Card>

        <Card>
          <SectionHeader
            title={t('staffSales.pipelineTitle')}
            subtitle={t('staffSales.pipelineSubtitle')}
          />
          <FlatList
            data={leads}
            keyExtractor={(item) => item.id}
            ListEmptyComponent={<Text style={styles.empty}>{t('staffSales.empty')}</Text>}
            renderItem={({ item }) => (
              <View style={styles.row}>
                <Text style={styles.rowTitle}>{item.name}</Text>
                <Text style={styles.rowMeta}>{item.source}</Text>
              </View>
            )}
          />
        </Card>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, gap: 16 },
  label: { fontSize: 13, fontWeight: '600', color: '#334155' },
  spaced: { marginTop: 12 },
  input: {
    marginTop: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  buttonRow: { marginTop: 16 },
  empty: { color: '#64748b', fontSize: 15, marginTop: 8 },
  row: {
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e2e8f0',
  },
  rowTitle: { fontSize: 16, fontWeight: '600', color: '#0f172a' },
  rowMeta: { fontSize: 13, color: '#64748b', marginTop: 4 },
});
