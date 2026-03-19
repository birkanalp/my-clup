import {
  ListInvoicesRequestSchema,
  ListInvoicesResponseSchema,
  ListPaymentsRequestSchema,
  ListPaymentsResponseSchema,
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
