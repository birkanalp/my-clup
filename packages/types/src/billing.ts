import type { SupportedLocale } from './locale';

export type InvoiceStatus = 'draft' | 'open' | 'paid' | 'void' | 'overdue';

export type PaymentStatus = 'pending' | 'succeeded' | 'failed' | 'refunded';

export type PaymentMethod = 'cash' | 'card' | 'bank_transfer' | 'online';

export type ReceivableStatus = 'open' | 'partial' | 'settled' | 'overdue';

export type ReminderChannel = 'sms' | 'email' | 'push' | 'whatsapp';

export interface InvoiceLineItem {
  id: string;
  label: string;
  quantity: number;
  unitAmount: number;
  totalAmount: number;
}

export interface Invoice {
  id: string;
  gymId: string;
  branchId: string | null;
  memberId: string;
  membershipInstanceId: string | null;
  status: InvoiceStatus;
  currency: string;
  subtotalAmount: number;
  discountAmount: number;
  totalAmount: number;
  dueAt: string;
  issuedAt: string;
  paidAt: string | null;
  lineItems: InvoiceLineItem[];
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  gymId: string;
  branchId: string | null;
  memberId: string;
  invoiceId: string | null;
  currency: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  paidAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Receivable {
  id: string;
  gymId: string;
  branchId: string | null;
  memberId: string;
  invoiceId: string | null;
  currency: string;
  amountDue: number;
  amountPaid: number;
  dueAt: string;
  status: ReceivableStatus;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentReminder {
  id: string;
  gymId: string;
  branchId: string | null;
  memberId: string;
  receivableId: string | null;
  channel: ReminderChannel;
  locale: SupportedLocale;
  status: 'queued' | 'sent' | 'failed';
  scheduledAt: string;
  sentAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ListInvoicesRequest {
  gymId?: string;
  branchId?: string;
  memberId?: string;
  status?: InvoiceStatus;
  cursor?: string;
  limit?: number;
}

export interface ListInvoicesResponse {
  items: Invoice[];
  nextCursor: string | null;
}

export interface ListPaymentsRequest {
  gymId?: string;
  branchId?: string;
  memberId?: string;
  status?: PaymentStatus;
  cursor?: string;
  limit?: number;
}

export interface ListPaymentsResponse {
  items: Payment[];
  nextCursor: string | null;
}

export interface LogPaymentRequest {
  gymId: string;
  branchId?: string | null;
  memberId: string;
  invoiceId?: string | null;
  currency: string;
  amount: number;
  method: PaymentMethod;
  status?: PaymentStatus;
  paidAt?: string | null;
  overrideReason?: string;
}

export type LogPaymentResponse = Payment;

export interface CreateInvoiceLineItemInput {
  label: string;
  quantity: number;
  unitAmount: number;
  totalAmount: number;
}

export interface CreateInvoiceRequest {
  gymId: string;
  branchId?: string | null;
  memberId: string;
  membershipInstanceId?: string | null;
  currency: string;
  dueAt: string;
  locale?: SupportedLocale;
  lineItems: CreateInvoiceLineItemInput[];
  discountAmount?: number;
}

export type CreateInvoiceResponse = Invoice;
export type GetInvoiceDetailResponse = Invoice;

export interface ListReceivablesRequest {
  gymId?: string;
  branchId?: string;
  memberId?: string;
  status?: ReceivableStatus;
  cursor?: string;
  limit?: number;
}

export interface ListReceivablesResponse {
  items: Receivable[];
  nextCursor: string | null;
}

export interface SettleReceivableRequest {
  paymentId?: string;
  amountPaid: number;
  settledAt?: string;
  note?: string;
}

export type SettleReceivableResponse = Receivable;

export type InstallmentStatus = 'active' | 'completed' | 'defaulted';

export interface InstallmentPlan {
  id: string;
  gymId: string;
  branchId: string | null;
  memberId: string;
  invoiceId: string | null;
  totalAmount: number;
  installmentCount: number;
  remainingInstallments: number;
  nextDueAt: string | null;
  status: InstallmentStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ListInstallmentsRequest {
  gymId?: string;
  branchId?: string;
  memberId?: string;
  status?: InstallmentStatus;
  cursor?: string;
  limit?: number;
}

export interface ListInstallmentsResponse {
  items: InstallmentPlan[];
  nextCursor: string | null;
}

export interface ApplyDiscountRequest {
  gymId: string;
  branchId?: string | null;
  memberId: string;
  invoiceId?: string;
  code: string;
  originalAmount: number;
}

export interface ApplyDiscountResponse {
  code: string;
  applied: boolean;
  discountAmount: number;
  finalAmount: number;
}

export interface TriggerPaymentReminderRequest {
  gymId: string;
  branchId?: string | null;
  memberId: string;
  receivableId?: string | null;
  channel: ReminderChannel;
  locale: SupportedLocale;
  scheduledAt?: string;
}

export type TriggerPaymentReminderResponse = PaymentReminder;
