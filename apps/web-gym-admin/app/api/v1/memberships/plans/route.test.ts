import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('@/src/server/membership/plans', () => ({
  listPlans: vi.fn(),
  createPlan: vi.fn(),
}));

import { GET, POST } from './route';
import * as plansServer from '@/src/server/membership/plans';

const mockListPlans = vi.mocked(plansServer.listPlans);
const mockCreatePlan = vi.mocked(plansServer.createPlan);
const validUuid = '550e8400-e29b-41d4-a716-446655440000';

describe('GET /api/v1/memberships/plans', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 200 for authenticated listing', async () => {
    mockListPlans.mockResolvedValue({ items: [] });
    const req = new NextRequest('http://localhost:3001/api/v1/memberships/plans', {
      headers: { Authorization: 'Bearer test-token' },
    });
    const res = await GET(req);
    expect(res.status).toBe(200);
  });
});

describe('POST /api/v1/memberships/plans', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 400 for invalid payload', async () => {
    const req = new NextRequest('http://localhost:3001/api/v1/memberships/plans', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer test-token' },
      body: JSON.stringify({ invalid: true }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('returns 200 for valid payload', async () => {
    mockCreatePlan.mockResolvedValue({
      id: validUuid,
      gymId: validUuid,
      branchId: null,
      name: 'Monthly',
      type: 'time_based',
      status: 'active',
      durationDays: 30,
      sessionCount: null,
      freezeRule: { maxDays: 5, maxCountPerPeriod: 1, period: 'month' },
      branchRestrictionEnabled: false,
      allowedBranchIds: [],
      pricingTiers: [{ label: 'Standard', amount: 1000, currency: 'TRY' }],
      discountRules: [],
      trialEnabled: false,
      createdAt: '2025-03-19T12:00:00.000Z',
      updatedAt: '2025-03-19T12:00:00.000Z',
    });

    const req = new NextRequest('http://localhost:3001/api/v1/memberships/plans', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer test-token' },
      body: JSON.stringify({
        gymId: validUuid,
        name: 'Monthly',
        type: 'time_based',
        durationDays: 30,
        sessionCount: null,
        freezeRule: { maxDays: 5, maxCountPerPeriod: 1, period: 'month' },
        branchRestrictionEnabled: false,
        allowedBranchIds: [],
        pricingTiers: [{ label: 'Standard', amount: 1000, currency: 'TRY' }],
        discountRules: [],
        trialEnabled: false,
      }),
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
  });
});
