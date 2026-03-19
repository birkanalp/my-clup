'use client';

import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { useTranslations } from 'next-intl';
import { useChatApi } from '@/src/contexts/ChatApiContext';

type TemplateItem = { id: string; key: string; body: string };

type Props = {
  gymId: string;
  branchId: string | null;
  onSelect: (templateId: string, dedupeKey: string) => Promise<void>;
};

export function TemplateSelector({ gymId, branchId, onSelect }: Props) {
  const t = useTranslations('chat');
  const api = useChatApi();
  const locale = useLocale();
  const [templates, setTemplates] = useState<TemplateItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!api) return;
    setLoading(true);
    api.chat.templates
      .list({ gymId, locale: locale as 'en' | 'tr', branchId })
      .then((res) => setTemplates(res.items))
      .finally(() => setLoading(false));
  }, [api, gymId, branchId, locale]);

  const handleSelect = (tpl: TemplateItem) => {
    const dedupeKey = `tpl-${tpl.id}-${Date.now()}`;
    onSelect(tpl.id, dedupeKey);
    setOpen(false);
  };

  if (templates.length === 0 && !loading) return null;

  return (
    <div style={{ marginBottom: '0.5rem' }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        disabled={loading}
        style={{
          padding: '0.25rem 0.5rem',
          fontSize: '0.75rem',
          border: '1px solid #ccc',
          borderRadius: 4,
          background: '#f9f9f9',
          cursor: loading ? 'not-allowed' : 'pointer',
        }}
      >
        {t('templates.select')}
      </button>
      {open && (
        <div
          style={{
            marginTop: '0.35rem',
            padding: '0.5rem',
            border: '1px solid #eee',
            borderRadius: 4,
            background: '#fff',
            maxHeight: 160,
            overflowY: 'auto',
          }}
        >
          {templates.map((tpl) => (
            <button
              key={tpl.id}
              type="button"
              onClick={() => handleSelect(tpl)}
              style={{
                display: 'block',
                width: '100%',
                padding: '0.35rem 0.5rem',
                textAlign: 'left',
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                fontSize: '0.875rem',
                borderRadius: 4,
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = '#f0f0f0';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              {tpl.key}: {tpl.body.slice(0, 50)}
              {tpl.body.length > 50 ? '…' : ''}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
