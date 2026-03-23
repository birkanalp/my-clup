import { z } from 'zod';

const UuidSchema = z.string().uuid();
const IsoDatetimeSchema = z.string().datetime();

export const InvoiceStatusSchema = z.enum(['draft', 'open', 'paid', 'void', 'overdue']);
export type InvoiceStatus = z.infer<typeof InvoiceStatusSchema>;

export const PaymentStatusSchema = z.enum(['pending', 'succeeded', 'failed', 'refunded']);
export type PaymentStatus = z.infer<typeof PaymentStatusSchema>;

export const PaymentMethodSchema = z.enum(['cash', 'card', 'bank_transfer', 'online']);
export type PaymentMethod = z.infer<typeof PaymentMethodSchema>;

export const ReceivableStatusSchema = z.enum(['open', 'partial', 'settled', 'overdue']);
export type ReceivableStatus = z.infer<typeof ReceivableStatusSchema>;

export const ReminderChannelSchema = z.enum(['sms', 'email', 'push', 'whatsapp']);
export type ReminderChannel = z.infer<typeof ReminderChannelSchema>;

export const InvoiceLineItemSchema = z.object({
  id: UuidSchema,
  label: z.string().min(1),
  quantity: z.number().positive(),
  unitAmount: z.number().nonnegative(),
  totalAmount: z.number().nonnegative(),
});
export type InvoiceLineItem = z.infer<typeof InvoiceLineItemSchema>;

export const InvoiceSchema = z.object({
  id: UuidSchema,
  gymId: UuidSchema,
  branchId: UuidSchema.nullable(),
  memberId: UuidSchema,
  membershipInstanceId: UuidSchema.nullable(),
  status: InvoiceStatusSchema,
  currency: z.string().regex(/^[A-Z]{3}$/),
  subtotalAmount: z.number().nonnegative(),
  discountAmount: z.number().nonnegative(),
  totalAmount: z.number().nonnegative(),
  dueAt: IsoDatetimeSchema,
  issuedAt: IsoDatetimeSchema,
  paidAt: IsoDatetimeSchema.nullable(),
  lineItems: z.array(InvoiceLineItemSchema).min(1),
  createdAt: IsoDatetimeSchema,
  updatedAt: IsoDatetimeSchema,
});
export type Invoice = z.infer<typeof InvoiceSchema>;

export const PaymentSchema = z.object({
  id: UuidSchema,
  gymId: UuidSchema,
  branchId: UuidSchema.nullable(),
  memberId: UuidSchema,
  invoiceId: UuidSchema.nullable(),
  currency: z.string().regex(/^[A-Z]{3}$/),
  amount: z.number().positive(),
  method: PaymentMethodSchema,
  status: PaymentStatusSchema,
  paidAt: IsoDatetimeSchema.nullable(),
  createdAt: IsoDatetimeSchema,
  updatedAt: IsoDatetimeSchema,
});
export type Payment = z.infer<typeof PaymentSchema>;

export const ReceivableSchema = z.object({
  id: UuidSchema,
  gymId: UuidSchema,
  branchId: UuidSchema.nullable(),
  memberId: UuidSchema,
  invoiceId: UuidSchema.nullable(),
  currency: z.string().regex(/^[A-Z]{3}$/),
  amountDue: z.number().nonnegative(),
  amountPaid: z.number().nonnegative(),
  dueAt: IsoDatetimeSchema,
  status: ReceivableStatusSchema,
  createdAt: IsoDatetimeSchema,
  updatedAt: IsoDatetimeSchema,
});
export type Receivable = z.infer<typeof ReceivableSchema>;

export const PaymentReminderSchema = z.object({
  id: UuidSchema,
  gymId: UuidSchema,
  branchId: UuidSchema.nullable(),
  memberId: UuidSchema,
  receivableId: UuidSchema.nullable(),
  channel: ReminderChannelSchema,
  locale: z.enum(['tr', 'en']),
  status: z.enum(['queued', 'sent', 'failed']),
  scheduledAt: IsoDatetimeSchema,
  sentAt: IsoDatetimeSchema.nullable(),
  createdAt: IsoDatetimeSchema,
  updatedAt: IsoDatetimeSchema,
});
export type PaymentReminder = z.infer<typeof PaymentReminderSchema>;

export const InstallmentStatusSchema = z.enum(['active', 'completed', 'defaulted']);
export type InstallmentStatus = z.infer<typeof InstallmentStatusSchema>;

export const InstallmentPlanSchema = z.object({
  id: UuidSchema,
  gymId: UuidSchema,
  branchId: UuidSchema.nullable(),
  memberId: UuidSchema,
  invoiceId: UuidSchema.nullable(),
  totalAmount: z.number().positive(),
  installmentCount: z.number().int().positive(),
  remainingInstallments: z.number().int().nonnegative(),
  nextDueAt: IsoDatetimeSchema.nullable(),
  status: InstallmentStatusSchema,
  createdAt: IsoDatetimeSchema,
  updatedAt: IsoDatetimeSchema,
});
export type InstallmentPlan = z.infer<typeof InstallmentPlanSchema>;

export const ListInvoicesRequestSchema = z.object({
  gymId: UuidSchema.optional(),
  branchId: UuidSchema.optional(),
  memberId: UuidSchema.optional(),
  status: InvoiceStatusSchema.optional(),
  cursor: z.string().optional(),
  limit: z.number().int().min(1).max(100).default(20),
});
export type ListInvoicesRequest = z.infer<typeof ListInvoicesRequestSchema>;

export const ListInvoicesResponseSchema = z.object({
  items: z.array(InvoiceSchema),
  nextCursor: z.string().nullable(),
});
export type ListInvoicesResponse = z.infer<typeof ListInvoicesResponseSchema>;

export const ListPaymentsRequestSchema = z.object({
  gymId: UuidSchema.optional(),
  branchId: UuidSchema.optional(),
  memberId: UuidSchema.optional(),
  status: PaymentStatusSchema.optional(),
  cursor: z.string().optional(),
  limit: z.number().int().min(1).max(100).default(20),
});
export type ListPaymentsRequest = z.infer<typeof ListPaymentsRequestSchema>;

export const ListPaymentsResponseSchema = z.object({
  items: z.array(PaymentSchema),
  nextCursor: z.string().nullable(),
});
export type ListPaymentsResponse = z.infer<typeof ListPaymentsResponseSchema>;

export const LogPaymentRequestSchema = z.object({
  gymId: UuidSchema,
  branchId: UuidSchema.nullable().optional(),
  memberId: UuidSchema,
  invoiceId: UuidSchema.nullable().optional(),
  currency: z.string().regex(/^[A-Z]{3}$/),
  amount: z.number().positive(),
  method: PaymentMethodSchema,
  status: PaymentStatusSchema.optional(),
  paidAt: IsoDatetimeSchema.nullable().optional(),
  overrideReason: z.string().max(500).optional(),
});
export type LogPaymentRequest = z.infer<typeof LogPaymentRequestSchema>;

export const LogPaymentResponseSchema = PaymentSchema;
export type LogPaymentResponse = z.infer<typeof LogPaymentResponseSchema>;

export const CreateInvoiceRequestSchema = z.object({
  gymId: UuidSchema,
  branchId: UuidSchema.nullable().optional(),
  memberId: UuidSchema,
  membershipInstanceId: UuidSchema.nullable().optional(),
  currency: z.string().regex(/^[A-Z]{3}$/),
  dueAt: IsoDatetimeSchema,
  locale: z.enum(['tr', 'en']).optional(),
  lineItems: z.array(InvoiceLineItemSchema.omit({ id: true })).min(1),
  discountAmount: z.number().nonnegative().optional(),
});
export type CreateInvoiceRequest = z.infer<typeof CreateInvoiceRequestSchema>;

export const CreateInvoiceResponseSchema = InvoiceSchema;
export type CreateInvoiceResponse = z.infer<typeof CreateInvoiceResponseSchema>;

export const GetInvoiceDetailRequestSchema = z.object({});
export type GetInvoiceDetailRequest = z.infer<typeof GetInvoiceDetailRequestSchema>;

export const GetInvoiceDetailResponseSchema = InvoiceSchema;
export type GetInvoiceDetailResponse = z.infer<typeof GetInvoiceDetailResponseSchema>;

export const ListReceivablesRequestSchema = z.object({
  gymId: UuidSchema.optional(),
  branchId: UuidSchema.optional(),
  memberId: UuidSchema.optional(),
  status: ReceivableStatusSchema.optional(),
  cursor: z.string().optional(),
  limit: z.number().int().min(1).max(100).default(20),
});
export type ListReceivablesRequest = z.infer<typeof ListReceivablesRequestSchema>;

export const ListReceivablesResponseSchema = z.object({
  items: z.array(ReceivableSchema),
  nextCursor: z.string().nullable(),
});
export type ListReceivablesResponse = z.infer<typeof ListReceivablesResponseSchema>;

export const SettleReceivableRequestSchema = z.object({
  paymentId: UuidSchema.optional(),
  amountPaid: z.number().positive(),
  settledAt: IsoDatetimeSchema.optional(),
  note: z.string().max(500).optional(),
});
export type SettleReceivableRequest = z.infer<typeof SettleReceivableRequestSchema>;

export const SettleReceivableResponseSchema = ReceivableSchema;
export type SettleReceivableResponse = z.infer<typeof SettleReceivableResponseSchema>;

export const ListInstallmentsRequestSchema = z.object({
  gymId: UuidSchema.optional(),
  branchId: UuidSchema.optional(),
  memberId: UuidSchema.optional(),
  status: InstallmentStatusSchema.optional(),
  cursor: z.string().optional(),
  limit: z.number().int().min(1).max(100).default(20),
});
export type ListInstallmentsRequest = z.infer<typeof ListInstallmentsRequestSchema>;

export const ListInstallmentsResponseSchema = z.object({
  items: z.array(InstallmentPlanSchema),
  nextCursor: z.string().nullable(),
});
export type ListInstallmentsResponse = z.infer<typeof ListInstallmentsResponseSchema>;

export const ApplyDiscountRequestSchema = z.object({
  gymId: UuidSchema,
  branchId: UuidSchema.nullable().optional(),
  memberId: UuidSchema,
  invoiceId: UuidSchema.optional(),
  code: z.string().min(1),
  originalAmount: z.number().positive(),
});
export type ApplyDiscountRequest = z.infer<typeof ApplyDiscountRequestSchema>;

export const ApplyDiscountResponseSchema = z.object({
  code: z.string(),
  applied: z.boolean(),
  discountAmount: z.number().nonnegative(),
  finalAmount: z.number().nonnegative(),
});
export type ApplyDiscountResponse = z.infer<typeof ApplyDiscountResponseSchema>;

export const TriggerPaymentReminderRequestSchema = z.object({
  gymId: UuidSchema,
  branchId: UuidSchema.nullable().optional(),
  memberId: UuidSchema,
  receivableId: UuidSchema.nullable().optional(),
  channel: ReminderChannelSchema,
  locale: z.enum(['tr', 'en']),
  scheduledAt: IsoDatetimeSchema.optional(),
});
export type TriggerPaymentReminderRequest = z.infer<typeof TriggerPaymentReminderRequestSchema>;

export const TriggerPaymentReminderResponseSchema = PaymentReminderSchema;
export type TriggerPaymentReminderResponse = z.infer<typeof TriggerPaymentReminderResponseSchema>;

export const BillingSummaryRequestSchema = z.object({
  gymId: UuidSchema.optional(),
  branchId: UuidSchema.optional(),
});
export type BillingSummaryRequest = z.infer<typeof BillingSummaryRequestSchema>;

export const BillingSummaryResponseSchema = z.object({
  outstandingAmount: z.number().nonnegative(),
  overdueAmount: z.number().nonnegative(),
  collectedThisMonthAmount: z.number().nonnegative(),
  currency: z.string().regex(/^[A-Z]{3}$/),
});
export type BillingSummaryResponse = z.infer<typeof BillingSummaryResponseSchema>;

export const RecordInvoicePaymentRequestSchema = z.object({
  amount: z.number().positive(),
  method: PaymentMethodSchema,
  paidAt: IsoDatetimeSchema.optional(),
  note: z.string().max(500).optional(),
});
export type RecordInvoicePaymentRequest = z.infer<typeof RecordInvoicePaymentRequestSchema>;

export const RecordInvoicePaymentResponseSchema = InvoiceSchema;
export type RecordInvoicePaymentResponse = z.infer<typeof RecordInvoicePaymentResponseSchema>;
