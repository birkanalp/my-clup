import type { NextRequest } from 'next/server';
import type {
  ApplyDiscountRequest,
  ApplyDiscountResponse,
  BillingSummaryRequest,
  BillingSummaryResponse,
  CreateInvoiceRequest,
  CreateInvoiceResponse,
  GetInvoiceDetailResponse,
  Invoice,
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
  RecordInvoicePaymentRequest,
  RecordInvoicePaymentResponse,
  SettleReceivableRequest,
  SettleReceivableResponse,
  TriggerPaymentReminderRequest,
  TriggerPaymentReminderResponse,
} from '@myclup/contracts/billing';
import {
  applyDiscount,
  AUDIT_EVENT_TYPES,
  createInvoice,
  createServerClient,
  ForbiddenError,
  getCurrentUser,
  getInvoiceDetail,
  getReceivableDetail,
  listInstallments,
  listInvoices,
  listPayments,
  listReceivables,
  logPayment,
  NotFoundError,
  requirePermission,
  resolveTenantScope,
  settleReceivable,
  triggerPaymentReminder,
  writeAuditEvent,
} from '@myclup/supabase';
import type { TenantScope } from '@myclup/types';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

function getClient() {
  return createServerClient({
    supabaseUrl: SUPABASE_URL,
    serviceRoleKey: SERVICE_ROLE_KEY,
  });
}

async function writeBillingAudit(
  client: ReturnType<typeof getClient>,
  params: Parameters<typeof writeAuditEvent>[1]
) {
  // Billing operations should not fail because of audit write failure.
  try {
    await writeAuditEvent(client, params);
  } catch (error) {
    console.error('[billing] audit write failed', error);
  }
}

async function getActorRole(
  client: ReturnType<typeof getClient>,
  userId: string,
  scope: TenantScope
): Promise<string> {
  const { data } = await client
    .from('user_role_assignments')
    .select('role, gym_id')
    .eq('user_id', userId);
  const rows = data ?? [];
  const platform = rows.find((row) => row.role === 'platform_admin' && row.gym_id === null);
  if (platform) return 'platform_admin';
  return rows.find((row) => row.gym_id === scope.gymId)?.role ?? 'staff';
}

function parseLimitCursor(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const limitRaw = sp.get('limit');
  const limit = limitRaw ? Number.parseInt(limitRaw, 10) : 20;
  return {
    cursor: sp.get('cursor') ?? undefined,
    limit: Number.isFinite(limit) ? limit : 20,
  };
}

function parseListPaymentsParams(req: NextRequest): ListPaymentsRequest {
  const sp = req.nextUrl.searchParams;
  const { cursor, limit } = parseLimitCursor(req);
  return {
    gymId: sp.get('gymId') ?? undefined,
    branchId: sp.get('branchId') ?? undefined,
    memberId: sp.get('memberId') ?? undefined,
    status: (sp.get('status') as ListPaymentsRequest['status']) ?? undefined,
    cursor,
    limit,
  };
}

function parseListInvoicesParams(req: NextRequest): ListInvoicesRequest {
  const sp = req.nextUrl.searchParams;
  const { cursor, limit } = parseLimitCursor(req);
  return {
    gymId: sp.get('gymId') ?? undefined,
    branchId: sp.get('branchId') ?? undefined,
    memberId: sp.get('memberId') ?? undefined,
    status: (sp.get('status') as ListInvoicesRequest['status']) ?? undefined,
    cursor,
    limit,
  };
}

function parseListReceivablesParams(req: NextRequest): ListReceivablesRequest {
  const sp = req.nextUrl.searchParams;
  const { cursor, limit } = parseLimitCursor(req);
  return {
    gymId: sp.get('gymId') ?? undefined,
    branchId: sp.get('branchId') ?? undefined,
    memberId: sp.get('memberId') ?? undefined,
    status: (sp.get('status') as ListReceivablesRequest['status']) ?? undefined,
    cursor,
    limit,
  };
}

function parseListInstallmentsParams(req: NextRequest): ListInstallmentsRequest {
  const sp = req.nextUrl.searchParams;
  const { cursor, limit } = parseLimitCursor(req);
  return {
    gymId: sp.get('gymId') ?? undefined,
    branchId: sp.get('branchId') ?? undefined,
    memberId: sp.get('memberId') ?? undefined,
    status: (sp.get('status') as ListInstallmentsRequest['status']) ?? undefined,
    cursor,
    limit,
  };
}

async function ensureScopeForRead(req: NextRequest, gymId?: string, branchId?: string) {
  const currentUser = await getCurrentUser(req);
  if (!currentUser) return null;
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) return null;

  const client = getClient();
  const scopes = await resolveTenantScope(client, currentUser.user.id, gymId, branchId);
  if (scopes.length === 0) {
    throw new ForbiddenError('No tenant scope for billing read');
  }

  const scope = scopes[0];
  await requirePermission(client, currentUser.user.id, scope, 'payments:read');
  return { client, currentUser, scope };
}

async function ensureScopeForWrite(req: NextRequest, gymId: string, branchId?: string | null) {
  const currentUser = await getCurrentUser(req);
  if (!currentUser) return null;
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) return null;

  const client = getClient();
  const scopes = await resolveTenantScope(
    client,
    currentUser.user.id,
    gymId,
    branchId ?? undefined
  );
  if (scopes.length === 0) {
    throw new ForbiddenError('No tenant scope for billing write');
  }

  const scope = scopes[0];
  await requirePermission(client, currentUser.user.id, scope, 'payments:write');
  return { client, currentUser, scope };
}

export async function listPaymentsServer(req: NextRequest): Promise<ListPaymentsResponse | null> {
  const params = parseListPaymentsParams(req);
  const scoped = await ensureScopeForRead(req, params.gymId, params.branchId);
  if (!scoped) return null;
  return listPayments(scoped.client, {
    ...params,
    gymId: scoped.scope.gymId,
    branchId: scoped.scope.branchId ?? params.branchId,
  });
}

export async function logPaymentServer(
  req: NextRequest,
  input: LogPaymentRequest
): Promise<LogPaymentResponse | null> {
  const scoped = await ensureScopeForWrite(req, input.gymId, input.branchId);
  if (!scoped) return null;
  const actorRole = await getActorRole(scoped.client, scoped.currentUser.user.id, scoped.scope);
  const timestamp = new Date().toISOString();

  if (input.overrideReason) {
    await requirePermission(
      scoped.client,
      scoped.currentUser.user.id,
      scoped.scope,
      'billing:override'
    );
    await writeBillingAudit(scoped.client, {
      event_type: AUDIT_EVENT_TYPES.billing_override,
      actor_id: scoped.currentUser.user.id,
      target_type: 'payments',
      target_id: input.invoiceId ?? null,
      payload: {
        subscription_id: input.invoiceId,
        previous_state: 'unpaid',
        new_state: input.status,
        reason: input.overrideReason,
        actor_role: actorRole,
        tenant_id: scoped.scope.gymId,
        action: 'billing_override',
        before_state: 'unpaid',
        after_state: input.status,
        timestamp,
      },
      tenant_context: { gym_id: scoped.scope.gymId, branch_id: scoped.scope.branchId ?? undefined },
    });
  }

  if (input.status === 'refunded') {
    await writeBillingAudit(scoped.client, {
      event_type: AUDIT_EVENT_TYPES.refund,
      actor_id: scoped.currentUser.user.id,
      target_type: 'payments',
      target_id: input.invoiceId ?? null,
      payload: {
        payment_id: input.invoiceId,
        amount_cents: Math.round(input.amount * 100),
        reason: input.overrideReason,
        actor_role: actorRole,
        tenant_id: scoped.scope.gymId,
        action: 'refund',
        before_state: 'paid',
        after_state: 'pending_refund',
        timestamp,
      },
      tenant_context: { gym_id: scoped.scope.gymId, branch_id: scoped.scope.branchId ?? undefined },
    });
  }

  const payment = await logPayment(scoped.client, {
    ...input,
    gymId: scoped.scope.gymId,
    branchId: scoped.scope.branchId,
  });

  if (input.overrideReason) {
    await writeBillingAudit(scoped.client, {
      event_type: AUDIT_EVENT_TYPES.billing_override,
      actor_id: scoped.currentUser.user.id,
      target_type: 'payments',
      target_id: payment.id,
      payload: {
        subscription_id: payment.invoiceId,
        previous_state: 'unpaid',
        new_state: payment.status,
        reason: input.overrideReason,
        actor_role: actorRole,
        tenant_id: payment.gymId,
        action: 'billing_override',
        before_state: 'unpaid',
        after_state: payment.status,
        timestamp: new Date().toISOString(),
      },
      tenant_context: { gym_id: payment.gymId, branch_id: payment.branchId ?? undefined },
    });
  }

  if (payment.status === 'refunded') {
    await writeBillingAudit(scoped.client, {
      event_type: AUDIT_EVENT_TYPES.refund,
      actor_id: scoped.currentUser.user.id,
      target_type: 'payments',
      target_id: payment.id,
      payload: {
        payment_id: payment.id,
        amount_cents: Math.round(payment.amount * 100),
        reason: input.overrideReason,
        actor_role: actorRole,
        tenant_id: payment.gymId,
        action: 'refund',
        before_state: 'pending_refund',
        after_state: 'refunded',
        timestamp: new Date().toISOString(),
      },
      tenant_context: { gym_id: payment.gymId, branch_id: payment.branchId ?? undefined },
    });
  }

  return payment;
}

export async function listInvoicesServer(req: NextRequest): Promise<ListInvoicesResponse | null> {
  const params = parseListInvoicesParams(req);
  const scoped = await ensureScopeForRead(req, params.gymId, params.branchId);
  if (!scoped) return null;
  return listInvoices(scoped.client, {
    ...params,
    gymId: scoped.scope.gymId,
    branchId: scoped.scope.branchId ?? params.branchId,
  });
}

export async function createInvoiceServer(
  req: NextRequest,
  input: CreateInvoiceRequest
): Promise<CreateInvoiceResponse | null> {
  const scoped = await ensureScopeForWrite(req, input.gymId, input.branchId);
  if (!scoped) return null;
  return createInvoice(scoped.client, {
    ...input,
    gymId: scoped.scope.gymId,
    branchId: scoped.scope.branchId,
  });
}

export async function getInvoiceDetailServer(
  req: NextRequest,
  invoiceId: string
): Promise<GetInvoiceDetailResponse | null> {
  const currentUser = await getCurrentUser(req);
  if (!currentUser) return null;
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) return null;

  const client = getClient();
  const invoice = await getInvoiceDetail(client, invoiceId);
  if (!invoice) {
    throw new NotFoundError('Invoice not found');
  }

  const scopes = await resolveTenantScope(
    client,
    currentUser.user.id,
    invoice.gymId,
    invoice.branchId ?? undefined
  );
  if (scopes.length === 0) {
    throw new ForbiddenError('No tenant scope for invoice detail');
  }
  await requirePermission(client, currentUser.user.id, scopes[0], 'payments:read');
  return invoice;
}

export async function listReceivablesServer(
  req: NextRequest
): Promise<ListReceivablesResponse | null> {
  const params = parseListReceivablesParams(req);
  const scoped = await ensureScopeForRead(req, params.gymId, params.branchId);
  if (!scoped) return null;
  return listReceivables(scoped.client, {
    ...params,
    gymId: scoped.scope.gymId,
    branchId: scoped.scope.branchId ?? params.branchId,
  });
}

export async function settleReceivableServer(
  req: NextRequest,
  receivableId: string,
  input: SettleReceivableRequest
): Promise<SettleReceivableResponse | null> {
  const currentUser = await getCurrentUser(req);
  if (!currentUser) return null;
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) return null;

  const client = getClient();
  const target = await getReceivableDetail(client, receivableId);
  if (!target) {
    throw new NotFoundError('Receivable not found');
  }

  const scopes = await resolveTenantScope(
    client,
    currentUser.user.id,
    target.gymId,
    target.branchId ?? undefined
  );
  if (scopes.length === 0) throw new ForbiddenError('No tenant scope for receivable settle');
  await requirePermission(client, currentUser.user.id, scopes[0], 'payments:write');
  return settleReceivable(client, receivableId, input);
}

export async function listInstallmentsServer(
  req: NextRequest
): Promise<ListInstallmentsResponse | null> {
  const params = parseListInstallmentsParams(req);
  const scoped = await ensureScopeForRead(req, params.gymId, params.branchId);
  if (!scoped) return null;
  return listInstallments(scoped.client, {
    ...params,
    gymId: scoped.scope.gymId,
    branchId: scoped.scope.branchId ?? params.branchId,
  });
}

export async function applyDiscountServer(
  req: NextRequest,
  input: ApplyDiscountRequest
): Promise<ApplyDiscountResponse | null> {
  const scoped = await ensureScopeForWrite(req, input.gymId, input.branchId);
  if (!scoped) return null;
  return applyDiscount(scoped.client, {
    ...input,
    gymId: scoped.scope.gymId,
    branchId: scoped.scope.branchId,
  });
}

export async function triggerPaymentReminderServer(
  req: NextRequest,
  input: TriggerPaymentReminderRequest
): Promise<TriggerPaymentReminderResponse | null> {
  const scoped = await ensureScopeForWrite(req, input.gymId, input.branchId);
  if (!scoped) return null;
  return triggerPaymentReminder(scoped.client, {
    ...input,
    gymId: scoped.scope.gymId,
    branchId: scoped.scope.branchId,
  });
}

export async function getBillingSummaryServer(
  req: NextRequest,
  params: BillingSummaryRequest
): Promise<BillingSummaryResponse | null> {
  const scoped = await ensureScopeForRead(req, params.gymId, params.branchId);
  if (!scoped) return null;

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  // Outstanding: open invoices not yet paid
  const [openResult, overdueResult, paidResult] = await Promise.all([
    scoped.client
      .from('invoices')
      .select('total_amount, currency')
      .eq('gym_id', scoped.scope.gymId)
      .in('status', ['open', 'draft']),
    scoped.client
      .from('invoices')
      .select('total_amount, currency')
      .eq('gym_id', scoped.scope.gymId)
      .eq('status', 'overdue'),
    scoped.client
      .from('invoices')
      .select('total_amount, currency')
      .eq('gym_id', scoped.scope.gymId)
      .eq('status', 'paid')
      .gte('paid_at', startOfMonth),
  ]);

  const currency =
    openResult.data?.[0]?.currency ??
    overdueResult.data?.[0]?.currency ??
    paidResult.data?.[0]?.currency ??
    'TRY';

  const sum = (rows: Array<{ total_amount: number | null }> | null) =>
    (rows ?? []).reduce((acc, row) => acc + (row.total_amount ?? 0), 0);

  return {
    outstandingAmount: sum(openResult.data),
    overdueAmount: sum(overdueResult.data),
    collectedThisMonthAmount: sum(paidResult.data),
    currency,
  };
}

export async function recordInvoicePaymentServer(
  req: NextRequest,
  invoiceId: string,
  input: RecordInvoicePaymentRequest
): Promise<RecordInvoicePaymentResponse | null> {
  const currentUser = await getCurrentUser(req);
  if (!currentUser) return null;
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) return null;

  const client = getClient();
  const invoice = await getInvoiceDetail(client, invoiceId);
  if (!invoice) {
    throw new NotFoundError('Invoice not found');
  }

  const scopes = await resolveTenantScope(
    client,
    currentUser.user.id,
    invoice.gymId,
    invoice.branchId ?? undefined
  );
  if (scopes.length === 0) {
    throw new ForbiddenError('No tenant scope for invoice payment');
  }
  const scope = scopes[0];
  await requirePermission(client, currentUser.user.id, scope, 'payments:write');

  const actorRole = await getActorRole(client, currentUser.user.id, scope);
  const paidAt = input.paidAt ?? new Date().toISOString();
  const timestamp = new Date().toISOString();

  // Record the payment
  await logPayment(client, {
    gymId: scope.gymId,
    branchId: scope.branchId,
    memberId: invoice.memberId,
    invoiceId,
    currency: invoice.currency,
    amount: input.amount,
    method: input.method,
    status: 'succeeded',
    paidAt,
  });

  // Mark invoice as paid
  const { data: updatedRows, error: updateError } = await client
    .from('invoices')
    .update({ status: 'paid', paid_at: paidAt, updated_at: timestamp })
    .eq('id', invoiceId)
    .select(
      'id, gym_id, branch_id, member_id, membership_instance_id, status, currency, subtotal_amount, discount_amount, total_amount, due_at, issued_at, paid_at, created_at, updated_at'
    );

  if (updateError) {
    console.error('[billing] invoice payment update failed', updateError);
    throw new Error('invoice_payment_failed');
  }

  const row = updatedRows?.[0];
  if (!row) {
    throw new NotFoundError('Invoice not found after update');
  }

  await writeBillingAudit(client, {
    event_type: AUDIT_EVENT_TYPES.billing_override,
    actor_id: currentUser.user.id,
    target_type: 'invoices',
    target_id: invoiceId,
    payload: {
      subscription_id: invoiceId,
      previous_state: invoice.status,
      new_state: 'paid',
      reason: input.note,
      actor_role: actorRole,
      tenant_id: scope.gymId,
      action: 'invoice_mark_paid',
      before_state: invoice.status,
      after_state: 'paid',
      timestamp,
    },
    tenant_context: { gym_id: scope.gymId, branch_id: scope.branchId ?? undefined },
  });

  // Build response matching Invoice schema
  const updatedInvoice: Invoice = {
    id: row.id,
    gymId: row.gym_id,
    branchId: row.branch_id,
    memberId: row.member_id,
    membershipInstanceId: row.membership_instance_id,
    status: row.status as Invoice['status'],
    currency: row.currency,
    subtotalAmount: row.subtotal_amount,
    discountAmount: row.discount_amount,
    totalAmount: row.total_amount,
    dueAt: row.due_at,
    issuedAt: row.issued_at,
    paidAt: row.paid_at,
    lineItems: invoice.lineItems,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };

  return updatedInvoice;
}
