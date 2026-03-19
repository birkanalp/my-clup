import { describe, expect, it } from 'vitest';
import {
  applyDiscountContract,
  ApplyDiscountRequestSchema,
  createInvoiceContract,
  getInvoiceDetailContract,
  InvoiceSchema,
  listInstallmentsContract,
  listInvoicesContract,
  listPaymentsContract,
  listReceivablesContract,
  ListInvoicesRequestSchema,
  ListInstallmentsRequestSchema,
  ListPaymentsRequestSchema,
  ListReceivablesRequestSchema,
  logPaymentContract,
  PaymentReminderSchema,
  PaymentSchema,
  ReceivableSchema,
  settleReceivableContract,
  SettleReceivableRequestSchema,
  triggerPaymentReminderContract,
  TriggerPaymentReminderRequestSchema,
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

    it('applies default limit for receivables and installments', () => {
      expect(ListReceivablesRequestSchema.parse({})).toEqual({ limit: 20 });
      expect(ListInstallmentsRequestSchema.parse({})).toEqual({ limit: 20 });
    });

    it('validates settle receivable payload', () => {
      const result = SettleReceivableRequestSchema.safeParse({
        amountPaid: 250,
        settledAt: validDatetime,
      });
      expect(result.success).toBe(true);
    });

    it('validates discount and reminder payloads', () => {
      const discount = ApplyDiscountRequestSchema.safeParse({
        gymId: validUuid,
        memberId: validUuid,
        code: 'WELCOME10',
        originalAmount: 1000,
      });
      expect(discount.success).toBe(true);

      const reminder = TriggerPaymentReminderRequestSchema.safeParse({
        gymId: validUuid,
        memberId: validUuid,
        channel: 'sms',
        locale: 'tr',
      });
      expect(reminder.success).toBe(true);
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

    it('write and detail contracts use expected endpoints', () => {
      expect(logPaymentContract.path).toBe('/api/v1/billing/payments');
      expect(logPaymentContract.method).toBe('POST');
      expect(createInvoiceContract.path).toBe('/api/v1/billing/invoices');
      expect(createInvoiceContract.method).toBe('POST');
      expect(getInvoiceDetailContract.path).toBe('/api/v1/billing/invoices/:id');
      expect(getInvoiceDetailContract.method).toBe('GET');
    });

    it('receivable/installment/discount/reminder contracts are versioned', () => {
      expect(listReceivablesContract.path).toBe('/api/v1/billing/receivables');
      expect(listReceivablesContract.method).toBe('GET');
      expect(settleReceivableContract.path).toBe('/api/v1/billing/receivables/:id/settle');
      expect(settleReceivableContract.method).toBe('POST');
      expect(listInstallmentsContract.path).toBe('/api/v1/billing/installments');
      expect(applyDiscountContract.path).toBe('/api/v1/billing/discounts/apply');
      expect(triggerPaymentReminderContract.path).toBe('/api/v1/billing/reminders/trigger');
    });
  });
});
