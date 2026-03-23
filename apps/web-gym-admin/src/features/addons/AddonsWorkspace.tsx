'use client';

import { useCallback, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import type { AddonPackageWithStatus } from '@myclup/contracts/addons';
import { getApi } from '@/src/lib/api';

type ApiShape = ReturnType<typeof getApi>;

type Props = {
  api?: ApiShape;
};

function statusTone(status: string): { background: string; color: string } {
  if (status === 'active') return { background: '#dcfce7', color: '#166534' };
  if (status === 'suspended') return { background: '#ffedd5', color: '#9a3412' };
  return { background: '#e2e8f0', color: '#334155' };
}

export function AddonsWorkspace({ api = getApi() }: Props) {
  const t = useTranslations('common');

  const [packages, setPackages] = useState<AddonPackageWithStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAddons = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await api.addons.list();
      setPackages(result.items);
    } catch {
      setError(t('gymAdminWeb.addons.errorBody'));
    } finally {
      setLoading(false);
    }
  }, [api, t]);

  useEffect(() => {
    void loadAddons();
  }, [loadAddons]);

  function renderPackageName(packageId: string): string {
    const map: Record<string, string> = {
      sms_messaging: t('gymAdminWeb.addons.packageSmsMessaging'),
      ai_chatbot: t('gymAdminWeb.addons.packageAiChatbot'),
      e_signature: t('gymAdminWeb.addons.packageESignature'),
      ads_campaigns: t('gymAdminWeb.addons.packageAdsCampaigns'),
    };
    return map[packageId] ?? packageId;
  }

  function renderStatusLabel(status: string): string {
    if (status === 'active') return t('gymAdminWeb.addons.statusActive');
    if (status === 'suspended') return t('gymAdminWeb.addons.statusSuspended');
    return t('gymAdminWeb.addons.statusInactive');
  }

  return (
    <div style={{ padding: '1.5rem', maxWidth: 1024, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0 }}>
          {t('gymAdminWeb.addons.heroTitle')}
        </h1>
        <p style={{ color: '#475569', marginTop: '0.25rem', marginBottom: 0 }}>
          {t('gymAdminWeb.addons.heroSubtitle')}
        </p>
      </div>

      {/* Loading */}
      {loading && (
        <p style={{ color: '#64748b' }}>{t('gymAdminWeb.addons.loadingBody')}</p>
      )}

      {/* Error */}
      {!loading && error && (
        <div style={{ color: '#991b1b', background: '#fee2e2', padding: '1rem', borderRadius: 6 }}>
          <strong>{t('gymAdminWeb.addons.errorTitle')}</strong>
          <p style={{ margin: '0.25rem 0 0' }}>{error}</p>
        </div>
      )}

      {/* Empty */}
      {!loading && !error && packages.length === 0 && (
        <div style={{ textAlign: 'center', padding: '3rem 0', color: '#64748b' }}>
          <p style={{ fontWeight: 600, margin: 0 }}>{t('gymAdminWeb.addons.emptyTitle')}</p>
          <p style={{ margin: '0.25rem 0 0' }}>{t('gymAdminWeb.addons.emptyBody')}</p>
        </div>
      )}

      {/* Card grid */}
      {!loading && !error && packages.length > 0 && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '1rem',
          }}
        >
          {packages.map((pkg) => {
            const tone = statusTone(pkg.status);
            const isActive = pkg.status === 'active';
            return (
              <div
                key={pkg.packageId}
                style={{
                  background: '#fff',
                  border: '1px solid #e2e8f0',
                  borderRadius: 8,
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                }}
              >
                {/* Package name + status badge */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
                  <h2 style={{ fontSize: '1rem', fontWeight: 600, margin: 0 }}>
                    {renderPackageName(pkg.packageId)}
                  </h2>
                  <span
                    style={{
                      ...tone,
                      padding: '0.125rem 0.5rem',
                      borderRadius: 9999,
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      whiteSpace: 'nowrap',
                      flexShrink: 0,
                    }}
                  >
                    {renderStatusLabel(pkg.status)}
                  </span>
                </div>

                {/* Activated date */}
                <p style={{ margin: 0, fontSize: '0.875rem', color: '#475569' }}>
                  {pkg.activatedAt
                    ? t('gymAdminWeb.addons.activatedAt', {
                        date: new Date(pkg.activatedAt).toLocaleDateString(),
                      })
                    : t('gymAdminWeb.addons.notActivated')}
                </p>

                {/* Usage stats */}
                {pkg.usageStats !== null &&
                  pkg.usageStats.creditsUsed !== undefined &&
                  pkg.usageStats.creditsTotal !== undefined && (
                    <p style={{ margin: 0, fontSize: '0.875rem', color: '#475569' }}>
                      {t('gymAdminWeb.addons.creditsUsed', {
                        used: pkg.usageStats.creditsUsed,
                        total: pkg.usageStats.creditsTotal,
                      })}
                    </p>
                  )}

                {/* Action */}
                <div style={{ marginTop: 'auto', paddingTop: '0.25rem' }}>
                  {isActive ? (
                    <button
                      disabled
                      style={{
                        background: '#0f172a',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 6,
                        padding: '0.5rem 1rem',
                        cursor: 'not-allowed',
                        fontWeight: 600,
                        fontSize: '0.875rem',
                        opacity: 0.5,
                      }}
                    >
                      {t('gymAdminWeb.addons.configureButton')}
                    </button>
                  ) : (
                    <div>
                      <button
                        disabled
                        style={{
                          background: 'transparent',
                          color: '#334155',
                          border: '1px solid #cbd5e1',
                          borderRadius: 6,
                          padding: '0.5rem 1rem',
                          cursor: 'not-allowed',
                          fontWeight: 600,
                          fontSize: '0.875rem',
                          opacity: 0.6,
                        }}
                      >
                        {t('gymAdminWeb.addons.requestActivationButton')}
                      </button>
                      <p style={{ margin: '0.5rem 0 0', fontSize: '0.75rem', color: '#64748b' }}>
                        {t('gymAdminWeb.addons.contactPlatformNote')}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
