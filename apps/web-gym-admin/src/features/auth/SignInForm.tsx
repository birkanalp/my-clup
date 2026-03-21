'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';

type SignInError = 'invalid_credentials' | 'unauthorized_role' | 'config_missing' | 'generic';

export function SignInForm() {
  const t = useTranslations('common.gymAdminWeb.signIn');
  const locale = useLocale();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<SignInError | null>(null);

  function errorMessage(err: SignInError): string {
    if (err === 'invalid_credentials') return t('errorInvalidCredentials');
    if (err === 'unauthorized_role') return t('errorUnauthorizedRole');
    if (err === 'config_missing') return t('errorConfigMissing');
    return t('errorGeneric');
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch('/api/v1/auth/sign-in', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const json = (await res.json()) as { ok: boolean; error?: string };

      if (!json.ok) {
        const serverError = json.error;
        if (serverError === 'invalid_credentials') {
          setError('invalid_credentials');
        } else if (serverError === 'unauthorized_role') {
          setError('unauthorized_role');
        } else if (serverError === 'config_missing') {
          setError('config_missing');
        } else {
          setError('generic');
        }
        return;
      }

      router.replace(`/${locale}`);
    } catch {
      setError('generic');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        padding: '2rem',
        background:
          'radial-gradient(circle at top, rgba(15,118,110,0.18), transparent 48%), #f4f7f2',
        fontFamily: 'sans-serif',
      }}
    >
      <section
        style={{
          width: 'min(30rem, 100%)',
          background: '#ffffff',
          borderRadius: 24,
          padding: '2rem',
          boxShadow: '0 24px 80px rgba(15, 23, 42, 0.12)',
          border: '1px solid rgba(15, 23, 42, 0.08)',
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: '0.8rem',
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: '#0f766e',
          }}
        >
          {t('eyebrow')}
        </p>
        <h1 style={{ margin: '0.75rem 0 0', fontSize: '2rem', lineHeight: 1.1 }}>{t('title')}</h1>
        <p style={{ color: '#475569', marginTop: '0.75rem' }}>{t('subtitle')}</p>

        <form
          onSubmit={(e) => {
            void handleSubmit(e);
          }}
          style={{ display: 'grid', gap: '1rem', marginTop: '1.5rem' }}
        >
          <label style={{ display: 'grid', gap: '0.35rem' }}>
            <span style={{ fontWeight: 600 }}>{t('emailLabel')}</span>
            <input
              data-testid="sign-in-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              placeholder={t('emailPlaceholder')}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: '100%',
                borderRadius: 14,
                border: '1px solid #cbd5e1',
                padding: '0.8rem 0.9rem',
                boxSizing: 'border-box',
              }}
            />
          </label>

          <label style={{ display: 'grid', gap: '0.35rem' }}>
            <span style={{ fontWeight: 600 }}>{t('passwordLabel')}</span>
            <input
              data-testid="sign-in-password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              placeholder={t('passwordPlaceholder')}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%',
                borderRadius: 14,
                border: '1px solid #cbd5e1',
                padding: '0.8rem 0.9rem',
                boxSizing: 'border-box',
              }}
            />
          </label>

          <button
            data-testid="sign-in-submit"
            type="submit"
            disabled={submitting}
            style={{
              border: 0,
              borderRadius: 999,
              padding: '0.9rem 1.2rem',
              fontWeight: 700,
              color: '#ffffff',
              background: submitting ? '#5eead4' : '#0f766e',
              cursor: submitting ? 'not-allowed' : 'pointer',
            }}
          >
            {submitting ? t('submitting') : t('submit')}
          </button>
        </form>

        {error ? (
          <p
            data-testid="sign-in-error"
            style={{ marginTop: '1rem', color: '#dc2626', fontWeight: 500 }}
          >
            {errorMessage(error)}
          </p>
        ) : null}
      </section>
    </main>
  );
}
