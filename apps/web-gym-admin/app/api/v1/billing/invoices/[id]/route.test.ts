import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('@/src/server/billing', () => ({
  getInvoiceDetailServer: vi.fn(),
}));

import { GET } from './route';
import * as billingServer from '@/src/server/billing';

const mockGetInvoiceDetailServer = vi.mocked(billingServer.getInvoiceDetailServer);
const validUuid = '550e8400-e29b-41d4-a716-446655440000';

describe('GET /api/v1/billing/invoices/:id', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 401 when unauthenticated', async () => {
    mockGetInvoiceDetailServer.mockResolvedValue(null);
    const req = new NextRequest(`http://localhost:3001/api/v1/billing/invoices/${validUuid}`);
    const res = await GET(req, { params: Promise.resolve({ id: validUuid }) });
    expect(res.status).toBe(401);
  });
});
