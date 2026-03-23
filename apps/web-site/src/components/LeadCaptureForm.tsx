'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useState, type FormEvent } from 'react';
import {
  ANALYTICS_SCHEMA_VERSION,
  McGa4Event,
  createNoopAnalyticsEmitter,
} from '@myclup/analytics';

export function LeadCaptureForm() {
  const t = useTranslations('common');
  const locale = useLocale();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setSubmitting(true);
    try {
      const res = await fetch('/api/v1/public/contact-leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          message: message.trim(),
          locale,
        }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || data.ok !== true) {
        setSubmitError(t('publicSite.lead.errorSubmit'));
        return;
      }
      const analytics = createNoopAnalyticsEmitter();
      analytics.track(McGa4Event.marketing_lead_submit, {
        schema_version: ANALYTICS_SCHEMA_VERSION,
        surface: 'web_site',
        locale,
        has_message: Boolean(message.trim()),
      });
      setSent(true);
    } catch {
      setSubmitError(t('publicSite.lead.errorSubmit'));
    } finally {
      setSubmitting(false);
    }
  };

  if (sent) {
    return (
      <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-900">
        {t('publicSite.lead.thanks')}
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 grid max-w-lg gap-4">
      <label className="grid gap-1 text-sm font-medium text-gray-800">
        {t('publicSite.lead.name')}
        <input
          required
          value={name}
          onChange={(ev) => setName(ev.target.value)}
          className="rounded-md border border-gray-300 px-3 py-2"
        />
      </label>
      <label className="grid gap-1 text-sm font-medium text-gray-800">
        {t('publicSite.lead.email')}
        <input
          required
          type="email"
          value={email}
          onChange={(ev) => setEmail(ev.target.value)}
          className="rounded-md border border-gray-300 px-3 py-2"
        />
      </label>
      <label className="grid gap-1 text-sm font-medium text-gray-800">
        {t('publicSite.lead.message')}
        <textarea
          value={message}
          onChange={(ev) => setMessage(ev.target.value)}
          rows={4}
          className="rounded-md border border-gray-300 px-3 py-2"
        />
      </label>
      {submitError ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-900" role="alert">
          {submitError}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={submitting}
        className="rounded-full bg-teal-700 px-5 py-2.5 font-semibold text-white hover:bg-teal-800 disabled:opacity-60"
      >
        {submitting ? t('publicSite.lead.submitting') : t('publicSite.lead.submit')}
      </button>
    </form>
  );
}
