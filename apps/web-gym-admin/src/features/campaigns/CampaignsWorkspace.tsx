'use client';

import { useCallback, useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import type {
  CampaignRecord,
  CampaignTargetSegment,
  CreateCampaignRequest,
} from '@myclup/contracts/campaigns';
import { getApi } from '@/src/lib/api';

type ApiShape = ReturnType<typeof getApi>;

type Props = {
  api?: ApiShape;
};

type ViewState = 'list' | 'create';

const SEGMENTS: CampaignTargetSegment[] = ['all_members', 'expiring_soon', 'inactive'];

function statusTone(status: string): { background: string; color: string } {
  if (status === 'sent') return { background: '#dcfce7', color: '#166534' };
  if (status === 'failed') return { background: '#fee2e2', color: '#991b1b' };
  return { background: '#e2e8f0', color: '#334155' };
}

export function CampaignsWorkspace({ api = getApi() }: Props) {
  const t = useTranslations('common');
  const locale = useLocale();

  const [campaigns, setCampaigns] = useState<CampaignRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<ViewState>('list');

  // Create form state
  const [formTitle, setFormTitle] = useState('');
  const [formMessage, setFormMessage] = useState('');
  const [formSegment, setFormSegment] = useState<CampaignTargetSegment>('all_members');
  const [formError, setFormError] = useState<string | null>(null);
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Send confirm dialog state
  const [confirmCampaign, setConfirmCampaign] = useState<CampaignRecord | null>(null);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [sendError, setSendError] = useState<string | null>(null);

  const loadCampaigns = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await api.campaigns.list();
      setCampaigns(result.items);
    } catch {
      setError(t('gymAdminWeb.campaigns.errorBody'));
    } finally {
      setLoading(false);
    }
  }, [api, t]);

  useEffect(() => {
    void loadCampaigns();
  }, [loadCampaigns]);

  const handleCreate = useCallback(async () => {
    if (!formTitle.trim()) {
      setFormError(t('gymAdminWeb.campaigns.formErrorRequired'));
      return;
    }
    if (!formMessage.trim()) {
      setFormError(t('gymAdminWeb.campaigns.formErrorRequired'));
      return;
    }
    setFormError(null);
    setFormSubmitting(true);
    try {
      // gymId is resolved server-side from tenant scope; pass placeholder that gets overridden
      const input: CreateCampaignRequest = {
        gymId: '00000000-0000-0000-0000-000000000000',
        title: formTitle.trim(),
        messageBody: formMessage.trim(),
        targetSegment: formSegment,
        locale,
      };
      const created = await api.campaigns.create(input);
      setCampaigns((prev) => [created, ...prev]);
      setFormTitle('');
      setFormMessage('');
      setFormSegment('all_members');
      setView('list');
    } catch {
      setFormError(t('gymAdminWeb.campaigns.createError'));
    } finally {
      setFormSubmitting(false);
    }
  }, [api, formTitle, formMessage, formSegment, locale, t]);

  const handleSendConfirm = useCallback(async () => {
    if (!confirmCampaign) return;
    setSendingId(confirmCampaign.id);
    setSendError(null);
    try {
      const result = await api.campaigns.send(confirmCampaign.id, locale);
      setCampaigns((prev) =>
        prev.map((c) =>
          c.id === confirmCampaign.id
            ? {
                ...c,
                status: result.status,
                sentAt: result.sentAt,
                deliveryCount: result.deliveryCount,
              }
            : c
        )
      );
      setConfirmCampaign(null);
    } catch {
      setSendError(t('gymAdminWeb.campaigns.sendError'));
    } finally {
      setSendingId(null);
    }
  }, [api, confirmCampaign, locale, t]);

  function renderSegmentLabel(segment: CampaignTargetSegment): string {
    const map: Record<CampaignTargetSegment, string> = {
      all_members: t('gymAdminWeb.campaigns.segmentAllMembers'),
      expiring_soon: t('gymAdminWeb.campaigns.segmentExpiringSoon'),
      inactive: t('gymAdminWeb.campaigns.segmentInactive'),
    };
    return map[segment];
  }

  function renderStatusLabel(status: string): string {
    if (status === 'sent') return t('gymAdminWeb.campaigns.statusSent');
    if (status === 'failed') return t('gymAdminWeb.campaigns.statusFailed');
    return t('gymAdminWeb.campaigns.statusDraft');
  }

  return (
    <div style={{ padding: '1.5rem', maxWidth: 1024, margin: '0 auto' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: '1.5rem',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0 }}>
            {t('gymAdminWeb.campaigns.heroTitle')}
          </h1>
          <p style={{ color: '#475569', marginTop: '0.25rem', marginBottom: 0 }}>
            {t('gymAdminWeb.campaigns.heroSubtitle')}
          </p>
        </div>
        {view === 'list' && (
          <button
            onClick={() => setView('create')}
            style={{
              background: '#0f172a',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              padding: '0.5rem 1rem',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.875rem',
            }}
          >
            {t('gymAdminWeb.campaigns.createButton')}
          </button>
        )}
      </div>

      {/* Create form */}
      {view === 'create' && (
        <div
          style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: 8,
            padding: '1.5rem',
            marginBottom: '1.5rem',
          }}
        >
          <h2 style={{ fontSize: '1.125rem', fontWeight: 600, margin: '0 0 1rem' }}>
            {t('gymAdminWeb.campaigns.formTitle')}
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <label
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.25rem',
                fontWeight: 500,
                fontSize: '0.875rem',
              }}
            >
              {t('gymAdminWeb.campaigns.formLabelTitle')}
              <input
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder={t('gymAdminWeb.campaigns.formPlaceholderTitle')}
                style={{
                  padding: '0.5rem',
                  borderRadius: 4,
                  border: '1px solid #cbd5e1',
                  fontSize: '0.875rem',
                }}
              />
            </label>
            <label
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.25rem',
                fontWeight: 500,
                fontSize: '0.875rem',
              }}
            >
              {t('gymAdminWeb.campaigns.formLabelMessage')}
              <textarea
                value={formMessage}
                onChange={(e) => setFormMessage(e.target.value)}
                placeholder={t('gymAdminWeb.campaigns.formPlaceholderMessage')}
                rows={4}
                style={{
                  padding: '0.5rem',
                  borderRadius: 4,
                  border: '1px solid #cbd5e1',
                  fontSize: '0.875rem',
                  resize: 'vertical',
                }}
              />
            </label>
            <label
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.25rem',
                fontWeight: 500,
                fontSize: '0.875rem',
              }}
            >
              {t('gymAdminWeb.campaigns.formLabelSegment')}
              <select
                value={formSegment}
                onChange={(e) => setFormSegment(e.target.value as CampaignTargetSegment)}
                style={{
                  padding: '0.5rem',
                  borderRadius: 4,
                  border: '1px solid #cbd5e1',
                  fontSize: '0.875rem',
                }}
              >
                {SEGMENTS.map((seg) => (
                  <option key={seg} value={seg}>
                    {renderSegmentLabel(seg)}
                  </option>
                ))}
              </select>
            </label>
            {formError && (
              <p style={{ color: '#991b1b', margin: 0, fontSize: '0.875rem' }}>{formError}</p>
            )}
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={handleCreate}
                disabled={formSubmitting}
                style={{
                  background: '#0f172a',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 6,
                  padding: '0.5rem 1rem',
                  cursor: formSubmitting ? 'not-allowed' : 'pointer',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  opacity: formSubmitting ? 0.6 : 1,
                }}
              >
                {formSubmitting
                  ? t('gymAdminWeb.campaigns.formSubmitting')
                  : t('gymAdminWeb.campaigns.formSubmit')}
              </button>
              <button
                onClick={() => {
                  setView('list');
                  setFormError(null);
                }}
                style={{
                  background: 'transparent',
                  color: '#334155',
                  border: '1px solid #cbd5e1',
                  borderRadius: 6,
                  padding: '0.5rem 1rem',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                }}
              >
                {t('gymAdminWeb.campaigns.formCancel')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* List */}
      {loading && <p style={{ color: '#64748b' }}>{t('gymAdminWeb.campaigns.loadingBody')}</p>}
      {!loading && error && (
        <div style={{ color: '#991b1b', background: '#fee2e2', padding: '1rem', borderRadius: 6 }}>
          <strong>{t('gymAdminWeb.campaigns.errorTitle')}</strong>
          <p style={{ margin: '0.25rem 0 0' }}>{error}</p>
        </div>
      )}
      {!loading && !error && campaigns.length === 0 && (
        <div style={{ textAlign: 'center', padding: '3rem 0', color: '#64748b' }}>
          <p style={{ fontWeight: 600 }}>{t('gymAdminWeb.campaigns.emptyTitle')}</p>
          <p style={{ margin: '0.25rem 0 0' }}>{t('gymAdminWeb.campaigns.emptyBody')}</p>
        </div>
      )}
      {!loading && !error && campaigns.length > 0 && (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>
                <th style={{ padding: '0.5rem 0.75rem', fontWeight: 600 }}>
                  {t('gymAdminWeb.campaigns.tableColTitle')}
                </th>
                <th style={{ padding: '0.5rem 0.75rem', fontWeight: 600 }}>
                  {t('gymAdminWeb.campaigns.tableColSegment')}
                </th>
                <th style={{ padding: '0.5rem 0.75rem', fontWeight: 600 }}>
                  {t('gymAdminWeb.campaigns.tableColStatus')}
                </th>
                <th style={{ padding: '0.5rem 0.75rem', fontWeight: 600 }}>
                  {t('gymAdminWeb.campaigns.tableColDelivery')}
                </th>
                <th style={{ padding: '0.5rem 0.75rem', fontWeight: 600 }}>
                  {t('gymAdminWeb.campaigns.tableColActions')}
                </th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((campaign) => {
                const tone = statusTone(campaign.status);
                return (
                  <tr key={campaign.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '0.625rem 0.75rem', fontWeight: 500 }}>
                      {campaign.title}
                    </td>
                    <td style={{ padding: '0.625rem 0.75rem', color: '#475569' }}>
                      {renderSegmentLabel(campaign.targetSegment)}
                    </td>
                    <td style={{ padding: '0.625rem 0.75rem' }}>
                      <span
                        style={{
                          ...tone,
                          padding: '0.125rem 0.5rem',
                          borderRadius: 9999,
                          fontSize: '0.75rem',
                          fontWeight: 600,
                        }}
                      >
                        {renderStatusLabel(campaign.status)}
                      </span>
                    </td>
                    <td style={{ padding: '0.625rem 0.75rem', color: '#475569' }}>
                      {campaign.deliveryCount !== null ? campaign.deliveryCount : '—'}
                    </td>
                    <td style={{ padding: '0.625rem 0.75rem' }}>
                      {campaign.status === 'draft' && (
                        <button
                          onClick={() => {
                            setSendError(null);
                            setConfirmCampaign(campaign);
                          }}
                          style={{
                            background: '#0f172a',
                            color: '#fff',
                            border: 'none',
                            borderRadius: 4,
                            padding: '0.25rem 0.625rem',
                            cursor: 'pointer',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                          }}
                        >
                          {t('gymAdminWeb.campaigns.actionSend')}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Send confirm dialog */}
      {confirmCampaign && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="send-confirm-title"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 50,
          }}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: 8,
              padding: '1.5rem',
              maxWidth: 480,
              width: '100%',
              margin: '0 1rem',
              boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
            }}
          >
            <h2
              id="send-confirm-title"
              style={{ margin: '0 0 0.75rem', fontSize: '1.125rem', fontWeight: 700 }}
            >
              {t('gymAdminWeb.campaigns.sendConfirmTitle')}
            </h2>
            <p style={{ margin: '0 0 1rem', color: '#475569', fontSize: '0.875rem' }}>
              {confirmCampaign.deliveryCount !== null
                ? t('gymAdminWeb.campaigns.sendConfirmBody', {
                    title: confirmCampaign.title,
                    count: confirmCampaign.deliveryCount,
                  })
                : t('gymAdminWeb.campaigns.sendConfirmBodyUnknownCount', {
                    title: confirmCampaign.title,
                  })}
            </p>
            {sendError && (
              <p style={{ color: '#991b1b', margin: '0 0 0.75rem', fontSize: '0.875rem' }}>
                {sendError}
              </p>
            )}
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setConfirmCampaign(null);
                  setSendError(null);
                }}
                disabled={sendingId !== null}
                style={{
                  background: 'transparent',
                  color: '#334155',
                  border: '1px solid #cbd5e1',
                  borderRadius: 6,
                  padding: '0.5rem 1rem',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                }}
              >
                {t('gymAdminWeb.campaigns.sendConfirmCancel')}
              </button>
              <button
                onClick={handleSendConfirm}
                disabled={sendingId !== null}
                style={{
                  background: '#0f172a',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 6,
                  padding: '0.5rem 1rem',
                  cursor: sendingId !== null ? 'not-allowed' : 'pointer',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  opacity: sendingId !== null ? 0.6 : 1,
                }}
              >
                {t('gymAdminWeb.campaigns.sendConfirmSubmit')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
