import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('@/src/server/auth/sign-in', () => ({
  signIn: vi.fn(),
}));

import { POST } from './route';
import * as signInServer from '@/src/server/auth/sign-in';

const mockSignIn = vi.mocked(signInServer.signIn);

function makeRequest(body: unknown): NextRequest {
  return new NextRequest('http://localhost:3002/api/v1/auth/sign-in', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('POST /api/v1/auth/sign-in', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls signIn with validated credentials and returns the response', async () => {
    mockSignIn.mockResolvedValue({ ok: true });

    const req = makeRequest({ email: 'admin@example.com', password: 'secret' });
    const response = await POST(req);

    expect(response.status).toBe(200);
    const json = (await response.json()) as { ok: boolean };
    expect(json.ok).toBe(true);
    expect(mockSignIn).toHaveBeenCalledOnce();
    expect(mockSignIn).toHaveBeenCalledWith('admin@example.com', 'secret');
  });

  it('returns 400 when email is missing from the request body', async () => {
    const req = makeRequest({ password: 'secret' });
    const response = await POST(req);

    expect(response.status).toBe(400);
    const json = (await response.json()) as { error: string };
    expect(json.error).toBe('validation_error');
    expect(mockSignIn).not.toHaveBeenCalled();
  });

  it('returns 400 when the request body is not valid JSON', async () => {
    const req = new NextRequest('http://localhost:3002/api/v1/auth/sign-in', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'not-json',
    });
    const response = await POST(req);

    expect(response.status).toBe(400);
    const json = (await response.json()) as { error: string };
    expect(json.error).toBe('validation_error');
    expect(mockSignIn).not.toHaveBeenCalled();
  });
});
