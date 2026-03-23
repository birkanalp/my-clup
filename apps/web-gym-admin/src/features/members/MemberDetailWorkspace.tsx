'use client';

import { useCallback, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/src/i18n/navigation';
import { getApi } from '@/src/lib/api';
import type { GymMemberDetail } from '@myclup/api-client';

type Props = { memberId: string };

export function MemberDetailWorkspace({ memberId }: Props) {
  const t = useTranslations('common.gymAdminWeb.members.detail');
  const tStatus = useTranslations('common.gymAdminWeb.members');
  const router = useRouter();
  const api = getApi();

  const [member, setMember] = useState<GymMemberDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionPending, setActionPending] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [reason, setReason] = useState('');

  const loadMember = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.members.getMember(memberId);
      setMember(res);
    } catch {
      setError(t('error'));
    } finally {
      setLoading(false);
    }
  }, [api.members, memberId, t]);

  useEffect(() => {
    void loadMember();
  }, [loadMember]);

  const handleStatusUpdate = async (newStatus: 'suspended' | 'active') => {
    setActionPending(true);
    setActionError(null);
    setActionSuccess(null);
    try {
      await api.members.updateMemberStatus(memberId, { status: newStatus, reason: reason || undefined });
      setActionSuccess(t('actionSuccess'));
      setReason('');
      await loadMember();
    } catch {
      setActionError(t('actionError'));
    } finally {
      setActionPending(false);
    }
  };

  if (loading) {
    return <p style={{ color: '#64748b', padding: '1.5rem' }}>{t('loading')}</p>;
  }

  if (error || !member) {
    return <p style={{ color: '#dc2626', padding: '1.5rem' }}>{error ?? t('error')}</p>;
  }

  const isSuspended = member.membershipStatus === 'suspended';

  return (
    <div style={{ maxWidth: 680 }}>
      <p style={{ marginBottom: '1.25rem' }}>
        <button
          onClick={() => router.push('/members')}
          style={{
            background: 'none',
            border: 'none',
            color: '#0f766e',
            cursor: 'pointer',
            fontWeight: 600,
            padding: 0,
            fontSize: '0.875rem',
          }}
        >
          ← {t('backToList')}
        </button>
      </p>

      <section
        style={{
          border: '1px solid #e2e8f0',
          borderRadius: 12,
          padding: '1.25rem',
          marginBottom: '1rem',
        }}
      >
        <h2
          style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 1rem', color: '#1e293b' }}
        >
          {t('sectionProfile')}
        </h2>
        <dl style={{ margin: 0, display: 'grid', gridTemplateColumns: '160px 1fr', gap: '0.5rem 1rem' }}>
          <dt style={{ color: '#64748b', fontSize: '0.875rem' }}>{t('labelEmail')}</dt>
          <dd style={{ margin: 0, fontSize: '0.875rem', fontWeight: 500 }}>
            {member.email || '—'}
          </dd>
          <dt style={{ color: '#64748b', fontSize: '0.875rem' }}>{t('labelJoined')}</dt>
          <dd style={{ margin: 0, fontSize: '0.875rem' }}>
            {new Date(member.joinedAt).toLocaleDateString()}
          </dd>
        </dl>
      </section>

      <section
        style={{
          border: '1px solid #e2e8f0',
          borderRadius: 12,
          padding: '1.25rem',
          marginBottom: '1rem',
        }}
      >
        <h2
          style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 1rem', color: '#1e293b' }}
        >
          {t('sectionMembership')}
        </h2>
        <dl style={{ margin: 0, display: 'grid', gridTemplateColumns: '160px 1fr', gap: '0.5rem 1rem' }}>
          <dt style={{ color: '#64748b', fontSize: '0.875rem' }}>{t('labelStatus')}</dt>
          <dd style={{ margin: 0 }}>
            <span
              style={{
                display: 'inline-block',
                padding: '2px 10px',
                borderRadius: 12,
                fontSize: '0.75rem',
                fontWeight: 600,
                background:
                  member.membershipStatus === 'active'
                    ? '#16a34a20'
                    : member.membershipStatus === 'suspended'
                    ? '#dc262620'
                    : '#d9780620',
                color:
                  member.membershipStatus === 'active'
                    ? '#16a34a'
                    : member.membershipStatus === 'suspended'
                    ? '#dc2626'
                    : '#d97706',
              }}
            >
              {tStatus(`status${member.membershipStatus.charAt(0).toUpperCase()}${member.membershipStatus.slice(1)}` as never)}
            </span>
          </dd>
          <dt style={{ color: '#64748b', fontSize: '0.875rem' }}>{t('labelPlan')}</dt>
          <dd style={{ margin: 0, fontSize: '0.875rem' }}>
            {member.membershipPlanName ?? '—'}
          </dd>
          <dt style={{ color: '#64748b', fontSize: '0.875rem' }}>{t('labelValidUntil')}</dt>
          <dd style={{ margin: 0, fontSize: '0.875rem' }}>
            {member.membershipValidUntil
              ? new Date(member.membershipValidUntil).toLocaleDateString()
              : '—'}
          </dd>
          {member.remainingSessions !== null && (
            <>
              <dt style={{ color: '#64748b', fontSize: '0.875rem' }}>
                {t('labelRemainingSessions')}
              </dt>
              <dd style={{ margin: 0, fontSize: '0.875rem' }}>{member.remainingSessions}</dd>
            </>
          )}
        </dl>
      </section>

      <section
        style={{
          border: '1px solid #e2e8f0',
          borderRadius: 12,
          padding: '1.25rem',
        }}
      >
        <h2
          style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 1rem', color: '#1e293b' }}
        >
          {t('sectionActions')}
        </h2>

        <div style={{ marginBottom: '0.75rem' }}>
          <label
            style={{ display: 'block', fontSize: '0.875rem', color: '#374151', marginBottom: '0.375rem' }}
          >
            {t('reasonLabel')}
          </label>
          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={t('reasonPlaceholder')}
            style={{
              width: '100%',
              padding: '0.5rem 0.75rem',
              border: '1px solid #cbd5e1',
              borderRadius: 8,
              fontSize: '0.875rem',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {actionSuccess && (
          <p style={{ color: '#16a34a', fontSize: '0.875rem', marginBottom: '0.75rem' }}>
            {actionSuccess}
          </p>
        )}
        {actionError && (
          <p style={{ color: '#dc2626', fontSize: '0.875rem', marginBottom: '0.75rem' }}>
            {actionError}
          </p>
        )}

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {isSuspended ? (
            <button
              onClick={() => void handleStatusUpdate('active')}
              disabled={actionPending}
              style={{
                padding: '0.5rem 1.25rem',
                borderRadius: 8,
                border: 'none',
                background: '#16a34a',
                color: '#fff',
                fontWeight: 600,
                cursor: actionPending ? 'default' : 'pointer',
                fontSize: '0.875rem',
                opacity: actionPending ? 0.7 : 1,
              }}
            >
              {t('reactivate')}
            </button>
          ) : (
            <button
              onClick={() => void handleStatusUpdate('suspended')}
              disabled={actionPending || member.membershipStatus === 'no_membership'}
              style={{
                padding: '0.5rem 1.25rem',
                borderRadius: 8,
                border: 'none',
                background: '#dc2626',
                color: '#fff',
                fontWeight: 600,
                cursor: actionPending || member.membershipStatus === 'no_membership' ? 'default' : 'pointer',
                fontSize: '0.875rem',
                opacity: actionPending || member.membershipStatus === 'no_membership' ? 0.5 : 1,
              }}
            >
              {t('suspend')}
            </button>
          )}
        </div>
      </section>
    </div>
  );
}
