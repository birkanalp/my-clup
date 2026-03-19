import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('@/src/server/billing', () => ({
  triggerPaymentReminderServer: vi.fn(),
}));

import { POST } from './route';
import * as billingServer from '@/src/server/billing';

const mockTriggerPaymentReminderServer = vi.mocked(billingServer.triggerPaymentReminderServer);
const validUuid = '550e8400-e29b-41d4-a716-446655440000';

describe('POST /api/v1/billing/reminders/trigger', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 200 for valid reminder payload', async () => {
    mockTriggerPaymentReminderServer.mockResolvedValue({
      id: validUuid,
      gymId: validUuid,
      branchId: null,
      memberId: validUuid,
      receivableId: null,
      channel: 'sms',
      locale: 'tr',
      status: 'queued',
      scheduledAt: '2025-03-19T12:00:00.000Z',
      sentAt: null,
      createdAt: '2025-03-19T12:00:00.000Z',
      updatedAt: '2025-03-19T12:00:00.000Z',
    });
    const req = new NextRequest('http://localhost:3001/api/v1/billing/reminders/trigger', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer test-token' },
      body: JSON.stringify({
        gymId: validUuid,
        memberId: validUuid,
        channel: 'sms',
        locale: 'tr',
      }),
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
  });
});
