import {
  ApplyDiscountRequestSchema,
  ApplyDiscountResponseSchema,
  BillingSummaryRequestSchema,
  BillingSummaryResponseSchema,
  CreateInvoiceRequestSchema,
  CreateInvoiceResponseSchema,
  GetInvoiceDetailRequestSchema,
  GetInvoiceDetailResponseSchema,
  ListInstallmentsRequestSchema,
  ListInstallmentsResponseSchema,
  ListInvoicesRequestSchema,
  ListInvoicesResponseSchema,
  ListPaymentsRequestSchema,
  ListPaymentsResponseSchema,
  ListReceivablesRequestSchema,
  ListReceivablesResponseSchema,
  LogPaymentRequestSchema,
  LogPaymentResponseSchema,
  RecordInvoicePaymentRequestSchema,
  RecordInvoicePaymentResponseSchema,
  SettleReceivableRequestSchema,
  SettleReceivableResponseSchema,
  TriggerPaymentReminderRequestSchema,
  TriggerPaymentReminderResponseSchema,
} from './schemas';

export const listInvoicesContract = {
  path: '/api/v1/billing/invoices',
  method: 'GET' as const,
  request: ListInvoicesRequestSchema,
  response: ListInvoicesResponseSchema,
} as const;

export const listPaymentsContract = {
  path: '/api/v1/billing/payments',
  method: 'GET' as const,
  request: ListPaymentsRequestSchema,
  response: ListPaymentsResponseSchema,
} as const;

export const logPaymentContract = {
  path: '/api/v1/billing/payments',
  method: 'POST' as const,
  request: LogPaymentRequestSchema,
  response: LogPaymentResponseSchema,
} as const;

export const createInvoiceContract = {
  path: '/api/v1/billing/invoices',
  method: 'POST' as const,
  request: CreateInvoiceRequestSchema,
  response: CreateInvoiceResponseSchema,
} as const;

export const getInvoiceDetailContract = {
  path: '/api/v1/billing/invoices/:id',
  method: 'GET' as const,
  request: GetInvoiceDetailRequestSchema,
  response: GetInvoiceDetailResponseSchema,
} as const;

export const listReceivablesContract = {
  path: '/api/v1/billing/receivables',
  method: 'GET' as const,
  request: ListReceivablesRequestSchema,
  response: ListReceivablesResponseSchema,
} as const;

export const settleReceivableContract = {
  path: '/api/v1/billing/receivables/:id/settle',
  method: 'POST' as const,
  request: SettleReceivableRequestSchema,
  response: SettleReceivableResponseSchema,
} as const;

export const listInstallmentsContract = {
  path: '/api/v1/billing/installments',
  method: 'GET' as const,
  request: ListInstallmentsRequestSchema,
  response: ListInstallmentsResponseSchema,
} as const;

export const applyDiscountContract = {
  path: '/api/v1/billing/discounts/apply',
  method: 'POST' as const,
  request: ApplyDiscountRequestSchema,
  response: ApplyDiscountResponseSchema,
} as const;

export const triggerPaymentReminderContract = {
  path: '/api/v1/billing/reminders/trigger',
  method: 'POST' as const,
  request: TriggerPaymentReminderRequestSchema,
  response: TriggerPaymentReminderResponseSchema,
} as const;

export const getBillingSummaryContract = {
  path: '/api/v1/billing/summary',
  method: 'GET' as const,
  request: BillingSummaryRequestSchema,
  response: BillingSummaryResponseSchema,
} as const;

export const recordInvoicePaymentContract = {
  path: '/api/v1/billing/invoices/:id/payments',
  method: 'POST' as const,
  request: RecordInvoicePaymentRequestSchema,
  response: RecordInvoicePaymentResponseSchema,
} as const;
