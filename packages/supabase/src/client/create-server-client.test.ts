import { describe, it, expect } from 'vitest';
import { createServerClient } from './create-server-client';

describe('createServerClient', () => {
  const validUrl = 'https://test.supabase.co';
  const validKey = 'test-service-role-key-at-least-32-chars-long';

  it('returns a client instance when given valid options', () => {
    const client = createServerClient({
      supabaseUrl: validUrl,
      serviceRoleKey: validKey,
    });
    expect(client).toBeDefined();
    expect(typeof client.from).toBe('function');
    expect(typeof client.auth.getSession).toBe('function');
  });

  it('throws if supabaseUrl is missing', () => {
    expect(() =>
      createServerClient({
        supabaseUrl: '',
        serviceRoleKey: validKey,
      })
    ).toThrow('supabaseUrl is required');
  });

  it('throws if supabaseUrl is whitespace only', () => {
    expect(() =>
      createServerClient({
        supabaseUrl: '   ',
        serviceRoleKey: validKey,
      })
    ).toThrow('supabaseUrl is required');
  });

  it('throws if serviceRoleKey is missing', () => {
    expect(() =>
      createServerClient({
        supabaseUrl: validUrl,
        serviceRoleKey: '',
      })
    ).toThrow('serviceRoleKey is required');
  });

  it('throws if serviceRoleKey is whitespace only', () => {
    expect(() =>
      createServerClient({
        supabaseUrl: validUrl,
        serviceRoleKey: '   ',
      })
    ).toThrow('serviceRoleKey is required');
  });
});
