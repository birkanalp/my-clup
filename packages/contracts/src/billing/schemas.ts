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
