import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View, Text, TextInput, StyleSheet, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { Button, Card, ScreenContainer, SectionHeader } from '@myclup/ui-native';
import { useAuthSession } from '../../../src/lib/useAuthSession';
import { useStaffWhoami } from '../../../src/features/staff/useStaffWhoami';

export default function MembersWorkspaceScreen() {
  const { t } = useTranslation('common');
  const router = useRouter();
  const { session } = useAuthSession();
  const { whoami } = useStaffWhoami(Boolean(session));
  const [query, setQuery] = useState('');

  const membershipHint = useMemo(() => {
    if (!whoami) return t('staffMembers.statusUnknown');
    return t('staffMembers.tenantScope', {
      gym: whoami.tenantScope.gymId.slice(0, 8),
      branch: whoami.tenantScope.branchId ?? t('staffMembers.branchAll'),
    });
  }, [whoami, t]);

  return (
    <ScreenContainer>
      <View style={styles.container}>
        <Card>
          <SectionHeader title={t('staffMembers.title')} subtitle={t('staffMembers.subtitle')} />
          <Text style={styles.scope}>{membershipHint}</Text>
          <Text style={styles.label}>{t('staffMembers.searchLabel')}</Text>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder={t('staffMembers.searchPlaceholder')}
            style={styles.input}
            autoCapitalize="none"
          />
          <Text style={styles.emptyNote}>{t('staffMembers.searchNote')}</Text>
          <FlatList
            data={[]}
            keyExtractor={(_, i) => String(i)}
            renderItem={() => null}
            ListEmptyComponent={<Text style={styles.empty}>{t('staffMembers.emptySearch')}</Text>}
          />
        </Card>

        <Card>
          <SectionHeader
            title={t('staffMembers.attendanceSection')}
            subtitle={t('staffMembers.attendanceSubtitle')}
          />
          <View style={styles.buttonRow}>
            <Button onPress={() => router.push('/members/attendance')}>
              {t('staffMembers.openAttendance')}
            </Button>
          </View>
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
  scope: {
    marginTop: 8,
    color: '#64748b',
    fontSize: 13,
  },
  label: {
    marginTop: 16,
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
  },
  input: {
    marginTop: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  emptyNote: {
    marginTop: 8,
    color: '#94a3b8',
    fontSize: 13,
    lineHeight: 18,
  },
  empty: {
    marginTop: 12,
    color: '#64748b',
    fontSize: 15,
  },
  buttonRow: {
    marginTop: 12,
  },
});
