import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('@/src/server/membership/plans', () => ({
  updatePlan: vi.fn(),
  removePlan: vi.fn(),
}));

import { DELETE, PUT } from './route';
import * as plansServer from '@/src/server/membership/plans';

const mockUpdatePlan = vi.mocked(plansServer.updatePlan);
const mockRemovePlan = vi.mocked(plansServer.removePlan);
const id = '550e8400-e29b-41d4-a716-446655440000';

describe('PUT /api/v1/memberships/plans/:id', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 200 on successful update', async () => {
    mockUpdatePlan.mockResolvedValue({
      id,
      gymId: id,
      branchId: null,
      name: 'Updated',
      type: 'time_based',
      status: 'active',
      durationDays: 30,
      sessionCount: null,
      freezeRule: { maxDays: 5, maxCountPerPeriod: 1, period: 'month' },
      branchRestrictionEnabled: false,
      allowedBranchIds: [],
      pricingTiers: [{ label: 'Standard', amount: 1200, currency: 'TRY' }],
      discountRules: [],
      trialEnabled: false,
      createdAt: '2025-03-19T12:00:00.000Z',
      updatedAt: '2025-03-19T12:00:00.000Z',
    });

    const req = new NextRequest(`http://localhost:3001/api/v1/memberships/plans/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer test-token' },
      body: JSON.stringify({ name: 'Updated' }),
    });
    const res = await PUT(req, { params: Promise.resolve({ id }) });
    expect(res.status).toBe(200);
  });
});

describe('DELETE /api/v1/memberships/plans/:id', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 200 when plan is deactivated', async () => {
    mockRemovePlan.mockResolvedValue({ planId: id, deactivated: true });
    const req = new NextRequest(`http://localhost:3001/api/v1/memberships/plans/${id}`, {
      method: 'DELETE',
      headers: { Authorization: 'Bearer test-token' },
    });
    const res = await DELETE(req, { params: Promise.resolve({ id }) });
    expect(res.status).toBe(200);
  });
});
