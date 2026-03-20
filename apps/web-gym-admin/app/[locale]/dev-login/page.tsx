'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { clearDevAccessToken, setDevAccessToken } from '@/src/lib/devAccessToken';

export default function DevLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState(process.env.NEXT_PUBLIC_DEV_USER_EMAIL ?? '');
  const [password, setPassword] = useState(process.env.NEXT_PUBLIC_DEV_USER_PASSWORD ?? '');
  const [status, setStatus] = useState<string | null>(null);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';
    if (!supabaseUrl || !anonKey) {
      setStatus('Supabase public env vars are missing.');
      return;
    }

    const client = createClient(supabaseUrl, anonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const { data, error } = await client.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.session?.access_token) {
      setStatus(error?.message ?? 'Failed to create a local dev session.');
      return;
    }

    setDevAccessToken(data.session.access_token);
    setStatus('Dev session stored. Redirecting to chat.');
    router.push('/en/chat');
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
          Development Only
        </p>
        <h1 style={{ margin: '0.75rem 0 0', fontSize: '2rem', lineHeight: 1.1 }}>
          Local demo session
        </h1>
        <p style={{ color: '#475569', marginTop: '0.75rem' }}>
          This page signs into the local Supabase stack and stores a bearer token for the
          `web-gym-admin` BFF.
        </p>

        <form onSubmit={handleLogin} style={{ display: 'grid', gap: '1rem', marginTop: '1.5rem' }}>
          <label style={{ display: 'grid', gap: '0.35rem' }}>
            <span style={{ fontWeight: 600 }}>Email</span>
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              type="email"
              style={{
                width: '100%',
                borderRadius: 14,
                border: '1px solid #cbd5e1',
                padding: '0.8rem 0.9rem',
              }}
            />
          </label>

          <label style={{ display: 'grid', gap: '0.35rem' }}>
            <span style={{ fontWeight: 600 }}>Password</span>
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              style={{
                width: '100%',
                borderRadius: 14,
                border: '1px solid #cbd5e1',
                padding: '0.8rem 0.9rem',
              }}
            />
          </label>

          <button
            type="submit"
            style={{
              border: 0,
              borderRadius: 999,
              padding: '0.9rem 1.2rem',
              fontWeight: 700,
              color: '#ffffff',
              background: '#0f766e',
              cursor: 'pointer',
            }}
          >
            Sign in to local stack
          </button>
        </form>

        <button
          type="button"
          onClick={() => {
            clearDevAccessToken();
            setStatus('Local dev session cleared.');
          }}
          style={{
            marginTop: '0.75rem',
            border: '1px solid #cbd5e1',
            borderRadius: 999,
            padding: '0.75rem 1rem',
            background: 'transparent',
            cursor: 'pointer',
          }}
        >
          Clear stored token
        </button>

        {status ? (
          <p style={{ marginTop: '1rem', color: '#0f172a', fontWeight: 500 }}>{status}</p>
        ) : null}
      </section>
    </main>
  );
}
