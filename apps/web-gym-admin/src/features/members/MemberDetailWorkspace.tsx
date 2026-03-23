'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import type { MemberDetail, UpdateMemberStatusRequest } from '@myclup/contracts/members';
import { getApi } from '@/src/lib/api';

type ApiShape = ReturnType<typeof getApi>;

type Props = {
  memberId: string;
  api?: ApiShape;
};

type ActionState = 'idle' | 'pending' | 'success' | 'error';

function LabelRow({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div
      style={{
        display: 'flex',
        gap: '0.5rem',
        fontSize: '0.875rem',
        padding: '0.375rem 0',
        borderBottom: '1px solid #f1f5f9',
      }}
    >
      <span style={{ fontWeight: 600, color: '#475569', minWidth: 160 }}>{label}</span>
      <span style={{ color: '#0f172a' }}>{value ?? '—'}</span>
    </div>
  );
}

function SectionHeading({ title }: { title: string }) {
  return (
    <h2
      style={{
        fontSize: '1rem',
        fontWeight: 700,
        margin: '1.5rem 0 0.75rem',
        color: '#0f172a',
      }}
    >
      {title}
    </h2>
  );
}

export function MemberDetailWorkspace({ memberId, api = getApi() }: Props) {
  const t = useTranslations('common');
  const locale = useLocale();

  const [member, setMember] = useState<MemberDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionState, setActionState] = useState<ActionState>('idle');
  const [showConfirm, setShowConfirm] = useState<'suspend' | 'reactivate' | null>(null);

  const loadMember = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await api.members.get(memberId);
      setMember(result);
    } catch {
      setError(t('gymAdminWeb.members.detail.errorBody'));
    } finally {
      setLoading(false);
    }
  }, [api, memberId, t]);

  useEffect(() => {
    void loadMember();
  }, [loadMember]);

  const handleStatusAction = useCallback(
    async (action: 'suspend' | 'reactivate') => {
      setShowConfirm(null);
      setActionState('pending');
      try {
        const input: UpdateMemberStatusRequest = { action };
        await api.members.updateStatus(memberId, input);
        setActionState('success');
        void loadMember();
      } catch {
        setActionState('error');
      }
    },
    [api, memberId, loadMember]
  );

  const backHref = `/${locale}/members`;

  if (loading) {
    return (
      <div style={{ padding: '1.5rem', maxWidth: 720, margin: '0 auto' }}>
        <p style={{ color: '#64748b' }}>{t('gymAdminWeb.members.detail.loading')}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '1.5rem', maxWidth: 720, margin: '0 auto' }}>
        <div style={{ color: '#991b1b', background: '#fee2e2', padding: '1rem', borderRadius: 6 }}>
          <strong>{t('gymAdminWeb.members.detail.errorTitle')}</strong>
          <p style={{ margin: '0.25rem 0 0' }}>{error}</p>
        </div>
        <Link
          href={backHref}
          style={{ display: 'inline-block', marginTop: '1rem', color: '#0f172a', fontSize: '0.875rem' }}
        >
          ← {t('gymAdminWeb.members.detail.backToList')}
        </Link>
      </div>
    );
  }

  if (!member) {
    return (
      <div style={{ padding: '1.5rem', maxWidth: 720, margin: '0 auto' }}>
        <p style={{ color: '#64748b' }}>{t('gymAdminWeb.members.detail.notFound')}</p>
        <Link
          href={backHref}
          style={{ display: 'inline-block', marginTop: '1rem', color: '#0f172a', fontSize: '0.875rem' }}
        >
          ← {t('gymAdminWeb.members.detail.backToList')}
        </Link>
      </div>
    );
  }

  const membership = member.activeMembership;

  return (
    <div style={{ padding: '1.5rem', maxWidth: 720, margin: '0 auto' }}>
      {/* Back link */}
      <Link
        href={backHref}
        style={{ color: '#475569', fontSize: '0.875rem', textDecoration: 'none' }}
      >
        ← {t('gymAdminWeb.members.detail.backToList')}
      </Link>

      {/* Profile section */}
      <SectionHeading title={t('gymAdminWeb.members.detail.sectionProfile')} />
      <div
        style={{
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: 8,
          padding: '1rem',
        }}
      >
        <LabelRow label={t('gymAdminWeb.members.detail.labelName')} value={member.displayName} />
        <LabelRow label={t('gymAdminWeb.members.detail.labelEmail')} value={member.email} />
        <LabelRow label={t('gymAdminWeb.members.detail.labelPhone')} value={member.phone} />
        <LabelRow
          label={t('gymAdminWeb.members.detail.labelJoinedAt')}
          value={new Date(member.joinedAt).toLocaleDateString()}
        />
      </div>

      {/* Membership section */}
      <SectionHeading title={t('gymAdminWeb.members.detail.sectionMembership')} />
      <div
        style={{
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: 8,
          padding: '1rem',
        }}
      >
        {membership ? (
          <>
            <LabelRow label={t('gymAdminWeb.members.detail.labelPlan')} value={membership.planName} />
            <LabelRow label={t('gymAdminWeb.members.detail.labelStatus')} value={membership.status} />
            <LabelRow
              label={t('gymAdminWeb.members.detail.labelValidFrom')}
              value={new Date(membership.validFrom).toLocaleDateString()}
            />
            <LabelRow
              label={t('gymAdminWeb.members.detail.labelValidUntil')}
              value={
                membership.validUntil
                  ? new Date(membership.validUntil).toLocaleDateString()
                  : null
              }
            />
            <LabelRow
              label={t('gymAdminWeb.members.detail.labelRemainingSessions')}
              value={
                membership.remainingSessions !== null
                  ? String(membership.remainingSessions)
                  : null
              }
            />
          </>
        ) : (
          <p style={{ margin: 0, color: '#64748b', fontSize: '0.875rem' }}>
            {t('gymAdminWeb.members.detail.noActiveMembership')}
          </p>
        )}
      </div>

      {/* Actions section */}
      <SectionHeading title={t('gymAdminWeb.members.detail.sectionActions')} />
      <div
        style={{
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: 8,
          padding: '1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
        }}
      >
        {/* Action feedback */}
        {actionState === 'success' && (
          <p style={{ margin: 0, color: '#166534', fontSize: '0.875rem' }}>
            {t('gymAdminWeb.members.detail.actionSuccess')}
          </p>
        )}
        {actionState === 'error' && (
          <p style={{ margin: 0, color: '#991b1b', fontSize: '0.875rem' }}>
            {t('gymAdminWeb.members.detail.actionError')}
          </p>
        )}

        {/* Inline confirm panel */}
        {showConfirm && (
          <div
            style={{
              background: '#fff',
              border: '1px solid #e2e8f0',
              borderRadius: 6,
              padding: '0.875rem',
            }}
          >
            <p style={{ margin: '0 0 0.75rem', fontSize: '0.875rem', color: '#334155' }}>
              {showConfirm === 'suspend'
                ? t('gymAdminWeb.members.detail.suspendConfirm')
                : t('gymAdminWeb.members.detail.reactivateConfirm')}
            </p>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => void handleStatusAction(showConfirm)}
                disabled={actionState === 'pending'}
                style={{
                  background: showConfirm === 'suspend' ? '#991b1b' : '#166534',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 6,
                  padding: '0.375rem 0.875rem',
                  cursor: actionState === 'pending' ? 'not-allowed' : 'pointer',
                  fontWeight: 600,
                  fontSize: '0.8125rem',
                  opacity: actionState === 'pending' ? 0.6 : 1,
                }}
              >
                {actionState === 'pending'
                  ? t('gymAdminWeb.members.detail.actionPending')
                  : showConfirm === 'suspend'
                    ? t('gymAdminWeb.members.detail.actionSuspend')
                    : t('gymAdminWeb.members.detail.actionReactivate')}
              </button>
              <button
                onClick={() => setShowConfirm(null)}
                disabled={actionState === 'pending'}
                style={{
                  background: 'transparent',
                  color: '#334155',
                  border: '1px solid #cbd5e1',
                  borderRadius: 6,
                  padding: '0.375rem 0.875rem',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.8125rem',
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Action trigger buttons */}
        {!showConfirm && (
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => { setActionState('idle'); setShowConfirm('suspend'); }}
              style={{
                background: '#fee2e2',
                color: '#991b1b',
                border: '1px solid #fca5a5',
                borderRadius: 6,
                padding: '0.5rem 1rem',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.875rem',
              }}
            >
              {t('gymAdminWeb.members.detail.actionSuspend')}
            </button>
            <button
              onClick={() => { setActionState('idle'); setShowConfirm('reactivate'); }}
              style={{
                background: '#dcfce7',
                color: '#166534',
                border: '1px solid #86efac',
                borderRadius: 6,
                padding: '0.5rem 1rem',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.875rem',
              }}
            >
              {t('gymAdminWeb.members.detail.actionReactivate')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
