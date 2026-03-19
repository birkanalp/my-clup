import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { ForbiddenError } from '@myclup/supabase';

vi.mock('@myclup/supabase', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@myclup/supabase')>();
  return {
    ...actual,
    getCurrentUser: vi.fn(),
    createServerClient: vi.fn(),
    resolveTenantScope: vi.fn(),
    requirePermission: vi.fn(),
    writeAuditEvent: vi.fn(),
    listPayments: vi.fn(),
    logPayment: vi.fn(),
    listInvoices: vi.fn(),
    createInvoice: vi.fn(),
    getInvoiceDetail: vi.fn(),
    listReceivables: vi.fn(),
    getReceivableDetail: vi.fn(),
    settleReceivable: vi.fn(),
    listInstallments: vi.fn(),
    applyDiscount: vi.fn(),
    triggerPaymentReminder: vi.fn(),
  };
});

import * as supabase from '@myclup/supabase';
import {
  listPaymentsServer,
  logPaymentServer,
  settleReceivableServer,
  triggerPaymentReminderServer,
} from './index';

const mockGetCurrentUser = vi.mocked(supabase.getCurrentUser);
const mockCreateServerClient = vi.mocked(supabase.createServerClient);
const mockResolveTenantScope = vi.mocked(supabase.resolveTenantScope);
const mockRequirePermission = vi.mocked(supabase.requirePermission);
const mockWriteAuditEvent = vi.mocked(supabase.writeAuditEvent);
const mockLogPayment = vi.mocked(supabase.logPayment);
const mockGetReceivableDetail = vi.mocked(supabase.getReceivableDetail);
const mockSettleReceivable = vi.mocked(supabase.settleReceivable);
const mockTriggerPaymentReminder = vi.mocked(supabase.triggerPaymentReminder);

const validUuid = '550e8400-e29b-41d4-a716-446655440000';
const mockUser = {
  user: {
    id: validUuid,
    app_metadata: {},
    user_metadata: {},
    aud: 'authenticated',
    created_at: '2025-01-01T00:00:00.000Z',
  },
  profile: {
    userId: validUuid,
    displayName: 'Test',
    avatarUrl: null,
    locale: 'tr',
    fallbackLocale: 'en',
  },
} as unknown as supabase.CurrentUser;

describe('billing server module', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://test.supabase.co');
    vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'service-role-key');
    const mockClient = {
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ data: [{ role: 'gym_manager', gym_id: validUuid }] }),
        }),
      }),
    };
    mockCreateServerClient.mockReturnValue(mockClient as never);
    mockGetCurrentUser.mockResolvedValue(mockUser);
    mockResolveTenantScope.mockResolvedValue([{ gymId: validUuid, branchId: null }]);
    mockRequirePermission.mockResolvedValue(undefined);
    mockWriteAuditEvent.mockResolvedValue(validUuid);
  });

  it('returns null for unauthenticated list payments', async () => {
    mockGetCurrentUser.mockResolvedValue(null);
    const req = new NextRequest('http://localhost:3001/api/v1/billing/payments');
    const result = await listPaymentsServer(req);
    expect(result).toBeNull();
  });

  it('requires billing override permission and writes audit for override payment', async () => {
    mockLogPayment.mockResolvedValue({
      id: validUuid,
      gymId: validUuid,
      branchId: null,
      memberId: validUuid,
      invoiceId: validUuid,
      currency: 'TRY',
      amount: 1000,
      method: 'cash',
      status: 'succeeded',
      paidAt: '2025-03-19T12:00:00.000Z',
      createdAt: '2025-03-19T12:00:00.000Z',
      updatedAt: '2025-03-19T12:00:00.000Z',
    });

    const req = new NextRequest('http://localhost:3001/api/v1/billing/payments');
    const result = await logPaymentServer(req, {
      gymId: validUuid,
      memberId: validUuid,
      invoiceId: validUuid,
      currency: 'TRY',
      amount: 1000,
      method: 'cash',
      overrideReason: 'manual correction',
    });

    expect(result?.id).toBe(validUuid);
    expect(mockRequirePermission).toHaveBeenCalled();
    expect(mockWriteAuditEvent.mock.calls.length).toBeGreaterThanOrEqual(2);
  });

  it('writes before/after refund audits for refunded payment logging', async () => {
    mockLogPayment.mockResolvedValue({
      id: validUuid,
      gymId: validUuid,
      branchId: null,
      memberId: validUuid,
      invoiceId: validUuid,
      currency: 'TRY',
      amount: 1000,
      method: 'card',
      status: 'refunded',
      paidAt: '2025-03-19T12:00:00.000Z',
      createdAt: '2025-03-19T12:00:00.000Z',
      updatedAt: '2025-03-19T12:00:00.000Z',
    });

    const req = new NextRequest('http://localhost:3001/api/v1/billing/payments');
    const result = await logPaymentServer(req, {
      gymId: validUuid,
      memberId: validUuid,
      invoiceId: validUuid,
      currency: 'TRY',
      amount: 1000,
      method: 'card',
      status: 'refunded',
      overrideReason: 'refund request',
    });

    expect(result?.status).toBe('refunded');
    const refundCalls = mockWriteAuditEvent.mock.calls.filter(
      ([, payload]) => payload.event_type === supabase.AUDIT_EVENT_TYPES.refund
    );
    expect(refundCalls.length).toBeGreaterThanOrEqual(2);
  });

  it('throws forbidden when settling receivable without tenant scope', async () => {
    mockGetReceivableDetail.mockResolvedValue({
      id: validUuid,
      gymId: validUuid,
      branchId: null,
      memberId: validUuid,
      invoiceId: validUuid,
      currency: 'TRY',
      amountDue: 1000,
      amountPaid: 0,
      dueAt: '2025-03-20T12:00:00.000Z',
      status: 'open',
      createdAt: '2025-03-19T12:00:00.000Z',
      updatedAt: '2025-03-19T12:00:00.000Z',
    });
    mockResolveTenantScope.mockResolvedValue([]);
    const req = new NextRequest('http://localhost:3001/api/v1/billing/receivables');
    await expect(settleReceivableServer(req, validUuid, { amountPaid: 1000 })).rejects.toThrow(
      ForbiddenError
    );
  });

  it('settles receivable when authorized', async () => {
    mockGetReceivableDetail.mockResolvedValue({
      id: validUuid,
      gymId: validUuid,
      branchId: null,
      memberId: validUuid,
      invoiceId: validUuid,
      currency: 'TRY',
      amountDue: 1000,
      amountPaid: 0,
      dueAt: '2025-03-20T12:00:00.000Z',
      status: 'open',
      createdAt: '2025-03-19T12:00:00.000Z',
      updatedAt: '2025-03-19T12:00:00.000Z',
    });
    mockSettleReceivable.mockResolvedValue({
      id: validUuid,
      gymId: validUuid,
      branchId: null,
      memberId: validUuid,
      invoiceId: validUuid,
      currency: 'TRY',
      amountDue: 1000,
      amountPaid: 1000,
      dueAt: '2025-03-20T12:00:00.000Z',
      status: 'settled',
      createdAt: '2025-03-19T12:00:00.000Z',
      updatedAt: '2025-03-19T12:00:00.000Z',
    });
    const req = new NextRequest('http://localhost:3001/api/v1/billing/receivables');
    const result = await settleReceivableServer(req, validUuid, { amountPaid: 1000 });
    expect(result?.status).toBe('settled');
  });

  it('triggers payment reminder in tenant scope', async () => {
    mockTriggerPaymentReminder.mockResolvedValue({
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
    const req = new NextRequest('http://localhost:3001/api/v1/billing/reminders/trigger');
    const result = await triggerPaymentReminderServer(req, {
      gymId: validUuid,
      memberId: validUuid,
      channel: 'sms',
      locale: 'tr',
    });
    expect(result?.status).toBe('queued');
  });
});
