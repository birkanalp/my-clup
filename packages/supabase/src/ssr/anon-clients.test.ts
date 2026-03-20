import { describe, expect, it } from 'vitest';
import { createAnonBrowserClient, createAnonSsrServerClient } from './anon-clients';

describe('createAnonBrowserClient', () => {
  it('throws when supabaseUrl is missing', () => {
    expect(() => createAnonBrowserClient({ supabaseUrl: '', supabaseAnonKey: 'anon' })).toThrow(
      /supabaseUrl is required/
    );
  });

  it('throws when anon key is missing', () => {
    expect(() =>
      createAnonBrowserClient({ supabaseUrl: 'https://x.supabase.co', supabaseAnonKey: '  ' })
    ).toThrow(/supabaseAnonKey is required/);
  });

  it('returns a Supabase client when options are valid', () => {
    const client = createAnonBrowserClient({
      supabaseUrl: 'https://example.supabase.co',
      supabaseAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test',
    });
    expect(client).toBeDefined();
    expect(typeof client.from).toBe('function');
  });
});

describe('createAnonSsrServerClient', () => {
  const cookies = {
    getAll: () => [] as { name: string; value: string }[],
  };

  it('throws when supabaseUrl is missing', () => {
    expect(() =>
      createAnonSsrServerClient({
        supabaseUrl: '',
        supabaseAnonKey: 'anon',
        cookies,
      })
    ).toThrow(/supabaseUrl is required/);
  });

  it('throws when anon key is missing', () => {
    expect(() =>
      createAnonSsrServerClient({
        supabaseUrl: 'https://x.supabase.co',
        supabaseAnonKey: '',
        cookies,
      })
    ).toThrow(/supabaseAnonKey is required/);
  });

  it('returns a Supabase client when options are valid', () => {
    const client = createAnonSsrServerClient({
      supabaseUrl: 'https://example.supabase.co',
      supabaseAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test',
      cookies,
    });
    expect(client).toBeDefined();
    expect(typeof client.from).toBe('function');
  });
});
