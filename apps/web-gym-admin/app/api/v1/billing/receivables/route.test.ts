import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('@/src/server/billing', () => ({
  listReceivablesServer: vi.fn(),
}));

import { GET } from './route';
import * as billingServer from '@/src/server/billing';

const mockListReceivablesServer = vi.mocked(billingServer.listReceivablesServer);

describe('GET /api/v1/billing/receivables', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 401 when unauthenticated', async () => {
    mockListReceivablesServer.mockResolvedValue(null);
    const req = new NextRequest('http://localhost:3001/api/v1/billing/receivables');
    const res = await GET(req);
    expect(res.status).toBe(401);
  });
});
