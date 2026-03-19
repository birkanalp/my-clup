import type {
  ApplyDiscountRequest,
  ApplyDiscountResponse,
  CreateInvoiceRequest,
  CreateInvoiceResponse,
  GetInvoiceDetailResponse,
  InstallmentPlan,
  ListInstallmentsRequest,
  ListInstallmentsResponse,
  ListInvoicesRequest,
  ListInvoicesResponse,
  ListPaymentsRequest,
  ListPaymentsResponse,
  ListReceivablesRequest,
  ListReceivablesResponse,
  LogPaymentRequest,
  LogPaymentResponse,
  Payment,
  PaymentReminder,
  Receivable,
  SettleReceivableRequest,
  SettleReceivableResponse,
  TriggerPaymentReminderRequest,
  TriggerPaymentReminderResponse,
} from '@myclup/contracts/billing';
import type { Json } from '../generated/database.types';
import type { ServerSupabaseClient } from '../client';

type InvoiceRow = {
  id: string;
  gym_id: string;
  branch_id: string | null;
  member_id: string;
  membership_instance_id: string | null;
  status: GetInvoiceDetailResponse['status'];
  currency: string;
  subtotal_amount: number;
  discount_amount: number;
  total_amount: number;
  due_at: string;
  issued_at: string;
  paid_at: string | null;
  line_items: Json;
  created_at: string;
  updated_at: string;
};

type PaymentRow = {
  id: string;
  gym_id: string;
  branch_id: string | null;
  member_id: string;
  invoice_id: string | null;
  currency: string;
  amount: number;
  method: Payment['method'];
  status: Payment['status'];
  paid_at: string | null;
  created_at: string;
  updated_at: string;
};

type ReceivableRow = {
  id: string;
  gym_id: string;
  branch_id: string | null;
  member_id: string;
  invoice_id: string | null;
  currency: string;
  amount_due: number;
  amount_paid: number;
  due_at: string;
  status: Receivable['status'];
  created_at: string;
  updated_at: string;
};

type InstallmentRow = {
  id: string;
  gym_id: string;
  branch_id: string | null;
  member_id: string;
  invoice_id: string | null;
  total_amount: number;
  installment_count: number;
  remaining_installments: number;
  next_due_at: string | null;
  status: InstallmentPlan['status'];
  created_at: string;
  updated_at: string;
};

type ReminderRow = {
  id: string;
  gym_id: string;
  branch_id: string | null;
  member_id: string;
  receivable_id: string | null;
  channel: PaymentReminder['channel'];
  locale: PaymentReminder['locale'];
  status: PaymentReminder['status'];
  scheduled_at: string;
  sent_at: string | null;
  created_at: string;
  updated_at: string;
};

function toInvoice(row: InvoiceRow): GetInvoiceDetailResponse {
  const lineItems = Array.isArray(row.line_items) ? row.line_items : [];
  return {
    id: row.id,
    gymId: row.gym_id,
    branchId: row.branch_id,
    memberId: row.member_id,
    membershipInstanceId: row.membership_instance_id,
    status: row.status,
    currency: row.currency,
    subtotalAmount: row.subtotal_amount,
    discountAmount: row.discount_amount,
    totalAmount: row.total_amount,
    dueAt: row.due_at,
    issuedAt: row.issued_at,
    paidAt: row.paid_at,
    lineItems: lineItems as GetInvoiceDetailResponse['lineItems'],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toPayment(row: PaymentRow): Payment {
  return {
    id: row.id,
    gymId: row.gym_id,
    branchId: row.branch_id,
    memberId: row.member_id,
    invoiceId: row.invoice_id,
    currency: row.currency,
    amount: row.amount,
    method: row.method,
    status: row.status,
    paidAt: row.paid_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toReceivable(row: ReceivableRow): Receivable {
  return {
    id: row.id,
    gymId: row.gym_id,
    branchId: row.branch_id,
    memberId: row.member_id,
    invoiceId: row.invoice_id,
    currency: row.currency,
    amountDue: row.amount_due,
    amountPaid: row.amount_paid,
    dueAt: row.due_at,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toInstallmentPlan(row: InstallmentRow): InstallmentPlan {
  return {
    id: row.id,
    gymId: row.gym_id,
    branchId: row.branch_id,
    memberId: row.member_id,
    invoiceId: row.invoice_id,
    totalAmount: row.total_amount,
    installmentCount: row.installment_count,
    remainingInstallments: row.remaining_installments,
    nextDueAt: row.next_due_at,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toReminder(row: ReminderRow): PaymentReminder {
  return {
    id: row.id,
    gymId: row.gym_id,
    branchId: row.branch_id,
    memberId: row.member_id,
    receivableId: row.receivable_id,
    channel: row.channel,
    locale: row.locale,
    status: row.status,
    scheduledAt: row.scheduled_at,
    sentAt: row.sent_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function withCursorAndLimit<T extends { cursor?: string; limit?: number }>(
  query: ReturnType<ServerSupabaseClient['from']>,
  input: T
) {
  const limit = input.limit ?? 20;
  let q = query.order('updated_at', { ascending: false }).limit(limit + 1);
  if (input.cursor) {
    q = q.lt('id', input.cursor);
  }
  return { query: q, limit };
}

export async function listPayments(
  client: ServerSupabaseClient,
  input: ListPaymentsRequest
): Promise<ListPaymentsResponse> {
  let base = client
    .from('payments')
    .select(
      'id, gym_id, branch_id, member_id, invoice_id, currency, amount, method, status, paid_at, created_at, updated_at'
    );
  if (input.gymId) base = base.eq('gym_id', input.gymId);
  if (input.branchId) base = base.eq('branch_id', input.branchId);
  if (input.memberId) base = base.eq('member_id', input.memberId);
  if (input.status) base = base.eq('status', input.status);

  const { query, limit } = withCursorAndLimit(base, input);
  const { data, error } = await query;
  if (error) throw new Error(`listPayments failed: ${error.message}`);

  const rows = (data ?? []) as PaymentRow[];
  const hasMore = rows.length > limit;
  const items = (hasMore ? rows.slice(0, limit) : rows).map(toPayment);
  return { items, nextCursor: hasMore ? (rows[limit - 1]?.id ?? null) : null };
}

export async function logPayment(
  client: ServerSupabaseClient,
  input: LogPaymentRequest
): Promise<LogPaymentResponse> {
  const paidAt =
    input.status === 'succeeded' || input.status === 'refunded'
      ? (input.paidAt ?? new Date().toISOString())
      : null;
  const { data, error } = await client
    .from('payments')
    .insert({
      gym_id: input.gymId,
      branch_id: input.branchId ?? null,
      member_id: input.memberId,
      invoice_id: input.invoiceId ?? null,
      currency: input.currency,
      amount: input.amount,
      method: input.method,
      status: input.status ?? 'succeeded',
      paid_at: paidAt,
    })
    .select(
      'id, gym_id, branch_id, member_id, invoice_id, currency, amount, method, status, paid_at, created_at, updated_at'
    )
    .single();
  if (error || !data) throw new Error(`logPayment failed: ${error?.message}`);
  return toPayment(data as PaymentRow);
}

export async function listInvoices(
  client: ServerSupabaseClient,
  input: ListInvoicesRequest
): Promise<ListInvoicesResponse> {
  let base = client
    .from('invoices')
    .select(
      'id, gym_id, branch_id, member_id, membership_instance_id, status, currency, subtotal_amount, discount_amount, total_amount, due_at, issued_at, paid_at, line_items, created_at, updated_at'
    );
  if (input.gymId) base = base.eq('gym_id', input.gymId);
  if (input.branchId) base = base.eq('branch_id', input.branchId);
  if (input.memberId) base = base.eq('member_id', input.memberId);
  if (input.status) base = base.eq('status', input.status);

  const { query, limit } = withCursorAndLimit(base, input);
  const { data, error } = await query;
  if (error) throw new Error(`listInvoices failed: ${error.message}`);

  const rows = (data ?? []) as InvoiceRow[];
  const hasMore = rows.length > limit;
  const items = (hasMore ? rows.slice(0, limit) : rows).map(toInvoice);
  return { items, nextCursor: hasMore ? (rows[limit - 1]?.id ?? null) : null };
}

export async function createInvoice(
  client: ServerSupabaseClient,
  input: CreateInvoiceRequest
): Promise<CreateInvoiceResponse> {
  const issuedAt = new Date().toISOString();
  const subtotalAmount = input.lineItems.reduce<number>(
    (sum, item: CreateInvoiceRequest['lineItems'][number]) => sum + item.totalAmount,
    0
  );
  const discountAmount = input.discountAmount ?? 0;
  const totalAmount = Math.max(subtotalAmount - discountAmount, 0);
  const lineItems = input.lineItems.map((item: CreateInvoiceRequest['lineItems'][number]) => ({
    ...item,
    id: crypto.randomUUID(),
  }));

  const { data, error } = await client
    .from('invoices')
    .insert({
      gym_id: input.gymId,
      branch_id: input.branchId ?? null,
      member_id: input.memberId,
      membership_instance_id: input.membershipInstanceId ?? null,
      status: 'open',
      currency: input.currency,
      subtotal_amount: subtotalAmount,
      discount_amount: discountAmount,
      total_amount: totalAmount,
      due_at: input.dueAt,
      issued_at: issuedAt,
      paid_at: null,
      line_items: lineItems as unknown as Json,
      locale: input.locale ?? 'tr',
    })
    .select(
      'id, gym_id, branch_id, member_id, membership_instance_id, status, currency, subtotal_amount, discount_amount, total_amount, due_at, issued_at, paid_at, line_items, created_at, updated_at'
    )
    .single();
  if (error || !data) throw new Error(`createInvoice failed: ${error?.message}`);

  const invoice = toInvoice(data as InvoiceRow);
  await client.from('receivables').insert({
    gym_id: invoice.gymId,
    branch_id: invoice.branchId,
    member_id: invoice.memberId,
    invoice_id: invoice.id,
    currency: invoice.currency,
    amount_due: invoice.totalAmount,
    amount_paid: 0,
    due_at: invoice.dueAt,
    status: 'open',
  });
  return invoice;
}

export async function getInvoiceDetail(
  client: ServerSupabaseClient,
  invoiceId: string
): Promise<GetInvoiceDetailResponse | null> {
  const { data, error } = await client
    .from('invoices')
    .select(
      'id, gym_id, branch_id, member_id, membership_instance_id, status, currency, subtotal_amount, discount_amount, total_amount, due_at, issued_at, paid_at, line_items, created_at, updated_at'
    )
    .eq('id', invoiceId)
    .maybeSingle();
  if (error) throw new Error(`getInvoiceDetail failed: ${error.message}`);
  return data ? toInvoice(data as InvoiceRow) : null;
}

export async function listReceivables(
  client: ServerSupabaseClient,
  input: ListReceivablesRequest
): Promise<ListReceivablesResponse> {
  let base = client
    .from('receivables')
    .select(
      'id, gym_id, branch_id, member_id, invoice_id, currency, amount_due, amount_paid, due_at, status, created_at, updated_at'
    );
  if (input.gymId) base = base.eq('gym_id', input.gymId);
  if (input.branchId) base = base.eq('branch_id', input.branchId);
  if (input.memberId) base = base.eq('member_id', input.memberId);
  if (input.status) base = base.eq('status', input.status);

  const { query, limit } = withCursorAndLimit(base, input);
  const { data, error } = await query;
  if (error) throw new Error(`listReceivables failed: ${error.message}`);

  const rows = (data ?? []) as ReceivableRow[];
  const hasMore = rows.length > limit;
  const items = (hasMore ? rows.slice(0, limit) : rows).map(toReceivable);
  return { items, nextCursor: hasMore ? (rows[limit - 1]?.id ?? null) : null };
}

export async function settleReceivable(
  client: ServerSupabaseClient,
  receivableId: string,
  input: SettleReceivableRequest
): Promise<SettleReceivableResponse> {
  const { data: current, error: currentError } = await client
    .from('receivables')
    .select(
      'id, gym_id, branch_id, member_id, invoice_id, currency, amount_due, amount_paid, due_at, status, created_at, updated_at'
    )
    .eq('id', receivableId)
    .single();
  if (currentError || !current)
    throw new Error(`settleReceivable fetch failed: ${currentError?.message}`);

  const nextAmountPaid = current.amount_paid + input.amountPaid;
  const status = nextAmountPaid >= current.amount_due ? 'settled' : 'partial';
  const { data, error } = await client
    .from('receivables')
    .update({
      amount_paid: nextAmountPaid,
      status,
      updated_at: input.settledAt ?? new Date().toISOString(),
    })
    .eq('id', receivableId)
    .select(
      'id, gym_id, branch_id, member_id, invoice_id, currency, amount_due, amount_paid, due_at, status, created_at, updated_at'
    )
    .single();
  if (error || !data) throw new Error(`settleReceivable update failed: ${error?.message}`);
  return toReceivable(data as ReceivableRow);
}

export async function getReceivableDetail(
  client: ServerSupabaseClient,
  receivableId: string
): Promise<Receivable | null> {
  const { data, error } = await client
    .from('receivables')
    .select(
      'id, gym_id, branch_id, member_id, invoice_id, currency, amount_due, amount_paid, due_at, status, created_at, updated_at'
    )
    .eq('id', receivableId)
    .maybeSingle();
  if (error) throw new Error(`getReceivableDetail failed: ${error.message}`);
  return data ? toReceivable(data as ReceivableRow) : null;
}

export async function listInstallments(
  client: ServerSupabaseClient,
  input: ListInstallmentsRequest
): Promise<ListInstallmentsResponse> {
  let base = client
    .from('installment_plans')
    .select(
      'id, gym_id, branch_id, member_id, invoice_id, total_amount, installment_count, remaining_installments, next_due_at, status, created_at, updated_at'
    );
  if (input.gymId) base = base.eq('gym_id', input.gymId);
  if (input.branchId) base = base.eq('branch_id', input.branchId);
  if (input.memberId) base = base.eq('member_id', input.memberId);
  if (input.status) base = base.eq('status', input.status);

  const { query, limit } = withCursorAndLimit(base, input);
  const { data, error } = await query;
  if (error) throw new Error(`listInstallments failed: ${error.message}`);
  const rows = (data ?? []) as InstallmentRow[];
  const hasMore = rows.length > limit;
  const items = (hasMore ? rows.slice(0, limit) : rows).map(toInstallmentPlan);
  return { items, nextCursor: hasMore ? (rows[limit - 1]?.id ?? null) : null };
}

export async function applyDiscount(
  client: ServerSupabaseClient,
  input: ApplyDiscountRequest
): Promise<ApplyDiscountResponse> {
  const { data: code, error } = await client
    .from('discount_codes')
    .select('code, type, value, is_active')
    .eq('gym_id', input.gymId)
    .eq('code', input.code)
    .maybeSingle();

  if (error || !code || !code.is_active) {
    return {
      code: input.code,
      applied: false,
      discountAmount: 0,
      finalAmount: input.originalAmount,
    };
  }

  const discountAmount =
    code.type === 'percentage'
      ? Math.min((input.originalAmount * Number(code.value)) / 100, input.originalAmount)
      : Math.min(Number(code.value), input.originalAmount);

  return {
    code: input.code,
    applied: true,
    discountAmount,
    finalAmount: input.originalAmount - discountAmount,
  };
}

export async function triggerPaymentReminder(
  client: ServerSupabaseClient,
  input: TriggerPaymentReminderRequest
): Promise<TriggerPaymentReminderResponse> {
  const { data, error } = await client
    .from('payment_reminders')
    .insert({
      gym_id: input.gymId,
      branch_id: input.branchId ?? null,
      member_id: input.memberId,
      receivable_id: input.receivableId ?? null,
      channel: input.channel,
      locale: input.locale,
      status: 'queued',
      scheduled_at: input.scheduledAt ?? new Date().toISOString(),
      sent_at: null,
    })
    .select(
      'id, gym_id, branch_id, member_id, receivable_id, channel, locale, status, scheduled_at, sent_at, created_at, updated_at'
    )
    .single();
  if (error || !data) throw new Error(`triggerPaymentReminder failed: ${error?.message}`);
  return toReminder(data as ReminderRow);
}
