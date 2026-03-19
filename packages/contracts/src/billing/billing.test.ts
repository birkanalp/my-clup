import { describe, expect, it } from 'vitest';
import {
  InvoiceSchema,
  listInvoicesContract,
  listPaymentsContract,
  ListInvoicesRequestSchema,
  ListPaymentsRequestSchema,
  PaymentReminderSchema,
  PaymentSchema,
  ReceivableSchema,
} from './index';

const validUuid = '550e8400-e29b-41d4-a716-446655440000';
const validDatetime = '2025-03-19T12:00:00.000Z';

describe('billing contracts', () => {
  describe('entity schemas', () => {
    it('validates invoice', () => {
      const invoice = {
        id: validUuid,
        gymId: validUuid,
        branchId: null,
        memberId: validUuid,
        membershipInstanceId: null,
        status: 'open' as const,
        currency: 'TRY',
        subtotalAmount: 1000,
        discountAmount: 100,
        totalAmount: 900,
        dueAt: validDatetime,
        issuedAt: validDatetime,
        paidAt: null,
        lineItems: [
          {
            id: validUuid,
            label: 'Monthly Membership',
            quantity: 1,
            unitAmount: 1000,
            totalAmount: 1000,
          },
        ],
        createdAt: validDatetime,
        updatedAt: validDatetime,
      };

      expect(InvoiceSchema.parse(invoice)).toEqual(invoice);
    });

    it('validates payment', () => {
      const payment = {
        id: validUuid,
        gymId: validUuid,
        branchId: null,
        memberId: validUuid,
        invoiceId: validUuid,
        currency: 'TRY',
        amount: 900,
        method: 'card' as const,
        status: 'succeeded' as const,
        paidAt: validDatetime,
        createdAt: validDatetime,
        updatedAt: validDatetime,
      };

      expect(PaymentSchema.parse(payment)).toEqual(payment);
    });

    it('validates receivable', () => {
      const receivable = {
        id: validUuid,
        gymId: validUuid,
        branchId: null,
        memberId: validUuid,
        invoiceId: validUuid,
        currency: 'TRY',
        amountDue: 900,
        amountPaid: 0,
        dueAt: validDatetime,
        status: 'open' as const,
        createdAt: validDatetime,
        updatedAt: validDatetime,
      };

      expect(ReceivableSchema.parse(receivable)).toEqual(receivable);
    });

    it('validates payment reminder', () => {
      const reminder = {
        id: validUuid,
        gymId: validUuid,
        branchId: null,
        memberId: validUuid,
        receivableId: validUuid,
        channel: 'sms' as const,
        locale: 'tr' as const,
        status: 'queued' as const,
        scheduledAt: validDatetime,
        sentAt: null,
        createdAt: validDatetime,
        updatedAt: validDatetime,
      };

      expect(PaymentReminderSchema.parse(reminder)).toEqual(reminder);
    });
  });

  describe('query schemas', () => {
    it('applies default limit for invoice query', () => {
      expect(ListInvoicesRequestSchema.parse({})).toEqual({ limit: 20 });
    });

    it('rejects invalid payment query limit', () => {
      const result = ListPaymentsRequestSchema.safeParse({ limit: 101 });
      expect(result.success).toBe(false);
    });
  });

  describe('contract objects', () => {
    it('listInvoicesContract uses versioned endpoint', () => {
      expect(listInvoicesContract.path).toBe('/api/v1/billing/invoices');
      expect(listInvoicesContract.method).toBe('GET');
    });

    it('listPaymentsContract uses versioned endpoint', () => {
      expect(listPaymentsContract.path).toBe('/api/v1/billing/payments');
      expect(listPaymentsContract.method).toBe('GET');
    });
  });
});
