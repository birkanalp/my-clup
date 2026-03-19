/**
 * Integration tests for GET /api/v1/auth/session.
 *
 * Tests session validity response for authenticated and unauthenticated requests.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { SessionResponseSchema } from '@myclup/contracts/auth';

// Mock the session server module
vi.mock('@/src/server/auth/session', () => ({
  session: vi.fn(),
}));

import { GET } from './route';
import * as sessionServer from '@/src/server/auth/session';

const mockSession = vi.mocked(sessionServer.session);

describe('GET /api/v1/auth/session', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns valid:false when unauthenticated', async () => {
    mockSession.mockResolvedValue({ valid: false });

    const request = new NextRequest('http://localhost:3001/api/v1/auth/session', {
      method: 'GET',
    });

    const response = await GET(request);

    expect(response.status).toBe(200);
    const json = (await response.json()) as unknown;
    const parsed = SessionResponseSchema.safeParse(json);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.valid).toBe(false);
    }
  });

  it('returns valid:true when authenticated', async () => {
    mockSession.mockResolvedValue({ valid: true });

    const request = new NextRequest('http://localhost:3001/api/v1/auth/session', {
      method: 'GET',
      headers: { Authorization: 'Bearer test-token' },
    });

    const response = await GET(request);

    expect(response.status).toBe(200);
    const json = (await response.json()) as unknown;
    const parsed = SessionResponseSchema.safeParse(json);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.valid).toBe(true);
    }
  });
});
