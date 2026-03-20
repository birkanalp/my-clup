import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View, Text, TextInput, StyleSheet, ActivityIndicator } from 'react-native';
import { Button, Card, ScreenContainer, SectionHeader } from '@myclup/ui-native';
import { useAuthSession } from '../../../src/lib/useAuthSession';
import { useStaffWhoami } from '../../../src/features/staff/useStaffWhoami';
import { api } from '../../../src/lib/api';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export default function AttendanceCheckInScreen() {
  const { t } = useTranslation('common');
  const { session } = useAuthSession();
  const { whoami } = useStaffWhoami(Boolean(session));
  const [instanceId, setInstanceId] = useState('');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const branchId = whoami?.tenantScope.branchId ?? null;

  const onValidate = async () => {
    setError(null);
    setResult(null);
    if (!branchId) {
      setError(t('staffAttendance.noBranch'));
      return;
    }
    const trimmed = instanceId.trim();
    if (!UUID_RE.test(trimmed)) {
      setError(t('staffAttendance.invalidInstanceId'));
      return;
    }
    setBusy(true);
    try {
      const res = await api.membership.validateMembershipAccess(trimmed, {
        membershipInstanceId: trimmed,
        branchId,
      });
      setResult(
        t('staffAttendance.result', {
          status: res.status,
          outcome: res.result,
          reason: res.reason,
        })
      );
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : t('label.error'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScreenContainer>
      <View style={styles.container}>
        <Card>
          <SectionHeader
            title={t('staffAttendance.title')}
            subtitle={t('staffAttendance.subtitle')}
          />
          <Text style={styles.label}>{t('staffAttendance.instanceLabel')}</Text>
          <TextInput
            value={instanceId}
            onChangeText={setInstanceId}
            placeholder={t('staffAttendance.instancePlaceholder')}
            style={styles.input}
            autoCapitalize="none"
          />
          {!branchId ? <Text style={styles.warn}>{t('staffAttendance.noBranch')}</Text> : null}
          {error ? <Text style={styles.error}>{error}</Text> : null}
          {result ? <Text style={styles.ok}>{result}</Text> : null}
          <View style={styles.buttonRow}>
            {busy ? (
              <ActivityIndicator />
            ) : (
              <Button onPress={() => void onValidate()}>{t('staffAttendance.validate')}</Button>
            )}
          </View>
        </Card>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, gap: 16 },
  label: {
    marginTop: 12,
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
  warn: { marginTop: 10, color: '#b45309', fontSize: 13 },
  error: { marginTop: 10, color: '#b91c1c', fontSize: 14 },
  ok: { marginTop: 10, color: '#15803d', fontSize: 14 },
  buttonRow: { marginTop: 16 },
});
