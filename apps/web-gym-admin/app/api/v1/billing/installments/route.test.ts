import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('@/src/server/billing', () => ({
  listInstallmentsServer: vi.fn(),
}));

import { GET } from './route';
import * as billingServer from '@/src/server/billing';

const mockListInstallmentsServer = vi.mocked(billingServer.listInstallmentsServer);

describe('GET /api/v1/billing/installments', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 401 when unauthenticated', async () => {
    mockListInstallmentsServer.mockResolvedValue(null);
    const req = new NextRequest('http://localhost:3001/api/v1/billing/installments');
    const res = await GET(req);
    expect(res.status).toBe(401);
  });
});
