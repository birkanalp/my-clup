import { createClient } from '@supabase/supabase-js';
import {
  getDemoCredentials,
  getManagedSupabaseEnv,
  getSupabaseStatusEnv,
} from './local-supabase.mjs';

const ids = {
  gymId: '11111111-1111-4111-8111-111111111111',
  branchId: '22222222-2222-4222-8222-222222222222',
  membershipPlanId: '33333333-3333-4333-8333-333333333333',
  membershipInstanceId: '44444444-4444-4444-8444-444444444444',
  invoicePaidId: '55555555-5555-4555-8555-555555555555',
  invoiceOpenId: '66666666-6666-4666-8666-666666666666',
  paymentId: '77777777-7777-4777-8777-777777777777',
  receivableId: '88888888-8888-4888-8888-888888888888',
  installmentPlanId: '99999999-9999-4999-8999-999999999999',
  conversationId: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  messageMemberId: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
  messageStaffId: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
  assignmentId: 'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
  templateId: 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',
  quickReplyId: 'ffffffff-ffff-4fff-8fff-ffffffffffff',
  roleMemberId: '12121212-1212-4121-8121-121212121212',
  roleStaffId: '13131313-1313-4131-8131-131313131313',
};

const credentials = getDemoCredentials();
const supabaseEnv = getManagedSupabaseEnv(getSupabaseStatusEnv());
const admin = createClient(
  supabaseEnv.NEXT_PUBLIC_SUPABASE_URL,
  supabaseEnv.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

async function listUsers() {
  const { data, error } = await admin.auth.admin.listUsers();
  if (error) {
    throw error;
  }

  return data.users;
}

async function ensureAuthUser({ email, password, displayName }) {
  const existing = (await listUsers()).find((user) => user.email === email);

  if (existing) {
    const { data, error } = await admin.auth.admin.updateUserById(existing.id, {
      email,
      password,
      email_confirm: true,
      user_metadata: {
        display_name: displayName,
      },
    });

    if (error) {
      throw error;
    }

    return data.user;
  }

  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      display_name: displayName,
    },
  });

  if (error || !data.user) {
    throw error ?? new Error(`Failed to create auth user for ${email}`);
  }

  return data.user;
}

async function upsert(table, values, onConflict) {
  const query = admin.from(table).upsert(values, onConflict ? { onConflict } : undefined);
  const { error } = await query;
  if (error) {
    throw error;
  }
}

async function seed() {
  const member = await ensureAuthUser(credentials.member);
  const staff = await ensureAuthUser(credentials.staff);

  await upsert(
    'gyms',
    {
      id: ids.gymId,
      name: 'MyClup Demo Gym',
      slug: 'myclup-demo-gym',
      is_active: true,
      updated_at: new Date().toISOString(),
    },
    'id'
  );

  await upsert(
    'branches',
    {
      id: ids.branchId,
      gym_id: ids.gymId,
      name: 'Caddebostan Branch',
      is_active: true,
      updated_at: new Date().toISOString(),
    },
    'id'
  );

  await upsert(
    'profiles',
    [
      {
        user_id: member.id,
        display_name: credentials.member.displayName,
        locale: 'tr',
        fallback_locale: 'en',
        avatar_url: null,
        updated_at: new Date().toISOString(),
      },
      {
        user_id: staff.id,
        display_name: credentials.staff.displayName,
        locale: 'tr',
        fallback_locale: 'en',
        avatar_url: null,
        updated_at: new Date().toISOString(),
      },
    ],
    'user_id'
  );

  await upsert(
    'user_role_assignments',
    [
      {
        id: ids.roleMemberId,
        user_id: member.id,
        role: 'gym_staff',
        gym_id: ids.gymId,
        branch_id: ids.branchId,
        granted_by: staff.id,
      },
      {
        id: ids.roleStaffId,
        user_id: staff.id,
        role: 'gym_manager',
        gym_id: ids.gymId,
        branch_id: ids.branchId,
        granted_by: staff.id,
      },
    ],
    'id'
  );

  await upsert(
    'gym_staff',
    [
      {
        user_id: member.id,
        gym_id: ids.gymId,
        branch_id: ids.branchId,
        role: 'gym_staff',
        updated_at: new Date().toISOString(),
      },
      {
        user_id: staff.id,
        gym_id: ids.gymId,
        branch_id: ids.branchId,
        role: 'gym_manager',
        updated_at: new Date().toISOString(),
      },
    ],
    'user_id,gym_id,branch_id'
  );

  await upsert(
    'membership_plans',
    {
      id: ids.membershipPlanId,
      gym_id: ids.gymId,
      branch_id: ids.branchId,
      name: 'Unlimited Monthly',
      type: 'time_based',
      status: 'active',
      duration_days: 30,
      session_count: null,
      freeze_rule: {
        maxDays: 7,
        maxCountPerPeriod: 1,
        period: 'month',
      },
      branch_restriction_enabled: false,
      allowed_branch_ids: [ids.branchId],
      pricing_tiers: [{ code: 'monthly', amount: 1499, currency: 'TRY', billingPeriod: 'month' }],
      discount_rules: [],
      trial_enabled: false,
      updated_at: new Date().toISOString(),
    },
    'id'
  );

  const validFrom = new Date();
  validFrom.setDate(validFrom.getDate() - 25);
  const validUntil = new Date();
  validUntil.setDate(validUntil.getDate() + 5);

  await upsert(
    'membership_instances',
    {
      id: ids.membershipInstanceId,
      plan_id: ids.membershipPlanId,
      member_id: member.id,
      gym_id: ids.gymId,
      branch_id: ids.branchId,
      status: 'active',
      valid_from: validFrom.toISOString(),
      valid_until: validUntil.toISOString(),
      remaining_sessions: null,
      entitled_branch_ids: [ids.branchId],
      updated_at: new Date().toISOString(),
    },
    'id'
  );

  await upsert(
    'invoices',
    [
      {
        id: ids.invoicePaidId,
        gym_id: ids.gymId,
        branch_id: ids.branchId,
        member_id: member.id,
        membership_instance_id: ids.membershipInstanceId,
        status: 'paid',
        currency: 'TRY',
        subtotal_amount: '1499.00',
        discount_amount: '0.00',
        total_amount: '1499.00',
        due_at: validFrom.toISOString(),
        issued_at: validFrom.toISOString(),
        paid_at: new Date(validFrom.getTime() + 24 * 60 * 60 * 1000).toISOString(),
        line_items: [{ name: 'Unlimited Monthly', quantity: 1, amount: 1499 }],
        locale: 'tr',
        updated_at: new Date().toISOString(),
      },
      {
        id: ids.invoiceOpenId,
        gym_id: ids.gymId,
        branch_id: ids.branchId,
        member_id: member.id,
        membership_instance_id: ids.membershipInstanceId,
        status: 'open',
        currency: 'TRY',
        subtotal_amount: '1499.00',
        discount_amount: '0.00',
        total_amount: '1499.00',
        due_at: validUntil.toISOString(),
        issued_at: new Date().toISOString(),
        paid_at: null,
        line_items: [{ name: 'Renewal Preview', quantity: 1, amount: 1499 }],
        locale: 'tr',
        updated_at: new Date().toISOString(),
      },
    ],
    'id'
  );

  await upsert(
    'payments',
    {
      id: ids.paymentId,
      gym_id: ids.gymId,
      branch_id: ids.branchId,
      member_id: member.id,
      invoice_id: ids.invoicePaidId,
      currency: 'TRY',
      amount: '1499.00',
      method: 'card',
      status: 'succeeded',
      paid_at: new Date(validFrom.getTime() + 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    },
    'id'
  );

  await upsert(
    'receivables',
    {
      id: ids.receivableId,
      gym_id: ids.gymId,
      branch_id: ids.branchId,
      member_id: member.id,
      invoice_id: ids.invoiceOpenId,
      currency: 'TRY',
      amount_due: '1499.00',
      amount_paid: '0.00',
      due_at: validUntil.toISOString(),
      status: 'open',
      updated_at: new Date().toISOString(),
    },
    'id'
  );

  await upsert(
    'installment_plans',
    {
      id: ids.installmentPlanId,
      gym_id: ids.gymId,
      branch_id: ids.branchId,
      member_id: member.id,
      invoice_id: ids.invoiceOpenId,
      total_amount: '1499.00',
      installment_count: 3,
      remaining_installments: 2,
      next_due_at: validUntil.toISOString(),
      status: 'active',
      updated_at: new Date().toISOString(),
    },
    'id'
  );

  await upsert(
    'conversations',
    {
      id: ids.conversationId,
      gym_id: ids.gymId,
      branch_id: ids.branchId,
      type: 'support',
      metadata: {
        subject: 'Membership renewal follow-up',
      },
      updated_at: new Date().toISOString(),
    },
    'id'
  );

  await upsert(
    'conversation_participants',
    [
      {
        conversation_id: ids.conversationId,
        user_id: member.id,
        role: 'member',
      },
      {
        conversation_id: ids.conversationId,
        user_id: staff.id,
        role: 'staff',
      },
    ],
    'conversation_id,user_id'
  );

  await upsert(
    'messages',
    [
      {
        id: ids.messageMemberId,
        conversation_id: ids.conversationId,
        sender_id: member.id,
        content: 'Uyeligimi bu hafta yenilemek istiyorum.',
        dedupe_key: 'demo-member-message',
        created_at: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
      },
      {
        id: ids.messageStaffId,
        conversation_id: ids.conversationId,
        sender_id: staff.id,
        content: 'Hazirim. Odeme ekranindan devam edebiliriz.',
        dedupe_key: 'demo-staff-message',
        created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      },
    ],
    'id'
  );

  await upsert(
    'message_receipts',
    [
      {
        message_id: ids.messageMemberId,
        participant_id: staff.id,
        read_at: new Date().toISOString(),
      },
      {
        message_id: ids.messageStaffId,
        participant_id: member.id,
        read_at: new Date().toISOString(),
      },
    ],
    'message_id,participant_id'
  );

  await upsert(
    'conversation_assignments',
    {
      id: ids.assignmentId,
      conversation_id: ids.conversationId,
      assigned_to_user_id: staff.id,
      assigned_by_user_id: staff.id,
      assigned_at: new Date().toISOString(),
      unassigned_at: null,
    },
    'id'
  );

  await upsert(
    'message_templates',
    {
      id: ids.templateId,
      gym_id: ids.gymId,
      branch_id: ids.branchId,
      key: 'renewal_follow_up',
      default_locale: 'tr',
      updated_at: new Date().toISOString(),
    },
    'id'
  );

  await upsert(
    'message_template_variants',
    [
      {
        template_id: ids.templateId,
        locale: 'tr',
        body: 'Uyelik yenilemenizi bugun tamamlarsaniz gecis kesintisiz devam eder.',
        updated_at: new Date().toISOString(),
      },
      {
        template_id: ids.templateId,
        locale: 'en',
        body: 'If you renew today, your access continues without interruption.',
        updated_at: new Date().toISOString(),
      },
    ],
    'template_id,locale'
  );

  await upsert(
    'quick_replies',
    {
      id: ids.quickReplyId,
      gym_id: ids.gymId,
      branch_id: ids.branchId,
      key: 'renewal_ready',
      default_locale: 'tr',
      sort_order: 1,
      updated_at: new Date().toISOString(),
    },
    'id'
  );

  await upsert(
    'quick_reply_variants',
    [
      {
        quick_reply_id: ids.quickReplyId,
        locale: 'tr',
        label: 'Yenilemeye hazirim',
        body: 'Yenileme adimini simdi aciyorum.',
        updated_at: new Date().toISOString(),
      },
      {
        quick_reply_id: ids.quickReplyId,
        locale: 'en',
        label: 'Ready to renew',
        body: 'Opening the renewal step now.',
        updated_at: new Date().toISOString(),
      },
    ],
    'quick_reply_id,locale'
  );

  console.log('Seeded local demo data.');
  console.log(`Member demo: ${credentials.member.email} / ${credentials.member.password}`);
  console.log(`Staff demo: ${credentials.staff.email} / ${credentials.staff.password}`);
}

seed().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
