import type { MembershipScreenData } from './types';
import { Text, View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import QRCode from 'react-native-qrcode-svg';
import { formatIsoDate } from './helpers';
import { formatNumber } from '@myclup/utils';

export function MembershipCard({ data }: { data: MembershipScreenData }) {
  const { t } = useTranslation('membership');

  if (!data.membership) {
    return null;
  }

  const { membership, plan, locale } = data;
  const memberPassValue = `myclup://member-pass/${membership.id}`;

  return (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>{t('label.activeMembership')}</Text>

      <View style={styles.row}>
        <Text style={styles.label}>{t('label.packageName')}</Text>
        <Text style={styles.value}>{plan?.name ?? membership.planId}</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>{t('label.packageType')}</Text>
        <Text style={styles.value}>{plan ? t(`type.${plan.type}`) : membership.planId}</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>{t('label.status')}</Text>
        <Text style={styles.value}>{t(`status.${membership.status}`)}</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>{t('label.startDate')}</Text>
        <Text style={styles.value}>
          {formatIsoDate(membership.validFrom, locale, t('label.notAvailable'))}
        </Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>{t('label.endDate')}</Text>
        <Text style={styles.value}>
          {formatIsoDate(membership.validUntil, locale, t('label.notAvailable'))}
        </Text>
      </View>

      {membership.remainingSessions !== null ? (
        <View style={styles.row}>
          <Text style={styles.label}>{t('label.remainingSessions')}</Text>
          <Text style={styles.value}>{formatNumber(membership.remainingSessions, locale)}</Text>
        </View>
      ) : null}

      {membership.freezeStartAt && membership.freezeEndAt ? (
        <View style={styles.noticeBlock}>
          <Text style={styles.noticeTitle}>{t('message.frozen')}</Text>
          <Text style={styles.noticeText}>
            {formatIsoDate(membership.freezeStartAt, locale, t('label.notAvailable'))} -{' '}
            {formatIsoDate(membership.freezeEndAt, locale, t('label.notAvailable'))}
          </Text>
        </View>
      ) : null}

      <View style={styles.branchBlock}>
        <Text style={styles.label}>{t('label.branchAccess')}</Text>
        {membership.entitledBranchIds.length === 0 ? (
          <Text style={styles.branchItem}>{t('label.allBranches')}</Text>
        ) : (
          membership.entitledBranchIds.map((branchId) => (
            <Text key={branchId} style={styles.branchItem}>
              {branchId}
            </Text>
          ))
        )}
      </View>

      <View style={styles.passBlock}>
        <Text style={styles.label}>{t('label.memberPass')}</Text>
        <View testID="member-pass-qr" style={styles.qrWrapper}>
          <QRCode value={memberPassValue} size={132} />
        </View>
        <Text style={styles.passCode}>{membership.id}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    gap: 14,
    shadowColor: '#0f172a',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  value: {
    flex: 1,
    textAlign: 'right',
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
  },
  noticeBlock: {
    backgroundColor: '#ecfeff',
    borderRadius: 16,
    padding: 14,
    gap: 6,
  },
  noticeTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#155e75',
  },
  noticeText: {
    fontSize: 13,
    color: '#0f172a',
  },
  branchBlock: {
    gap: 8,
  },
  branchItem: {
    fontSize: 13,
    color: '#334155',
  },
  passBlock: {
    alignItems: 'center',
    gap: 10,
    paddingTop: 6,
  },
  qrWrapper: {
    padding: 12,
    borderRadius: 16,
    backgroundColor: '#f8fafc',
  },
  passCode: {
    fontSize: 12,
    color: '#64748b',
  },
});
