/**
 * Zod schemas for typed audit event payloads.
 *
 * Each sensitive flow has a structured payload schema to ensure
 * consistent, validated audit data.
 */

import { z } from 'zod';
import type { AuditEventType } from './event-types';

/** UUID string format */
const uuidSchema = z.string().uuid();

/** Role change: assignment modified (e.g. user_role_assignments, gym_staff) */
export const roleChangePayloadSchema = z.object({
  assignment_type: z.enum(['user_role_assignments', 'gym_staff']),
  previous_role: z.string().optional(),
  new_role: z.string(),
  reason: z.string().optional(),
});

/** Billing override: manual override of billing state */
export const billingOverridePayloadSchema = z.object({
  subscription_id: z.string().optional(),
  previous_state: z.string().optional(),
  new_state: z.string(),
  reason: z.string().optional(),
});

/** Membership extension: manual extension of membership validity */
export const membershipExtensionPayloadSchema = z.object({
  membership_id: uuidSchema,
  previous_end_at: z.string().optional(),
  new_end_at: z.string(),
  reason: z.string().optional(),
});

/** Refund: refund processed */
export const refundPayloadSchema = z.object({
  payment_id: z.string().optional(),
  amount_cents: z.number().int().nonnegative().optional(),
  reason: z.string().optional(),
});

/** Admin impersonation: platform/admin impersonates another user */
export const adminImpersonationPayloadSchema = z.object({
  impersonated_user_id: uuidSchema,
  action: z.enum(['start', 'end']),
});

/** Cross-tenant support: platform support accesses another tenant */
export const crossTenantSupportPayloadSchema = z.object({
  target_gym_id: uuidSchema,
  target_branch_id: uuidSchema.optional(),
  action: z.string(),
  reason: z.string().optional(),
});

/** Chat assignment: staff assignment or reassignment of conversation */
export const chatAssignmentPayloadSchema = z.object({
  assigned_by_user_id: uuidSchema,
  assigned_to_user_id: uuidSchema,
  assigned_at: z.string(),
  assigned_from_user_id: uuidSchema.nullable().optional(),
  assignment_id: uuidSchema.optional(),
});

/** Map event type to payload schema */
export const PAYLOAD_SCHEMAS: Partial<Record<AuditEventType, z.ZodType>> = {
  role_change: roleChangePayloadSchema,
  billing_override: billingOverridePayloadSchema,
  membership_extension: membershipExtensionPayloadSchema,
  refund: refundPayloadSchema,
  admin_impersonation: adminImpersonationPayloadSchema,
  cross_tenant_support: crossTenantSupportPayloadSchema,
  chat_assignment: chatAssignmentPayloadSchema,
};

/** Tenant context attached to all audit events */
export const tenantContextSchema = z.object({
  gym_id: z.string().uuid().optional(),
  branch_id: z.string().uuid().optional(),
});

export type RoleChangePayload = z.infer<typeof roleChangePayloadSchema>;
export type BillingOverridePayload = z.infer<typeof billingOverridePayloadSchema>;
export type MembershipExtensionPayload = z.infer<typeof membershipExtensionPayloadSchema>;
export type RefundPayload = z.infer<typeof refundPayloadSchema>;
export type AdminImpersonationPayload = z.infer<typeof adminImpersonationPayloadSchema>;
export type CrossTenantSupportPayload = z.infer<typeof crossTenantSupportPayloadSchema>;
export type ChatAssignmentPayload = z.infer<typeof chatAssignmentPayloadSchema>;
export type TenantContext = z.infer<typeof tenantContextSchema>;
