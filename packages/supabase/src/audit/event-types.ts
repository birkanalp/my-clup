/**
 * Audit event type constants.
 *
 * Per docs/07-technical-plan.md §9.2 and .cursor/rules/server-side-auth-permissions-and-tenant-safety.mdc:
 * These flows require mandatory audit logging.
 */

export const AUDIT_EVENT_TYPES = {
  role_change: 'role_change',
  billing_override: 'billing_override',
  membership_extension: 'membership_extension',
  refund: 'refund',
  admin_impersonation: 'admin_impersonation',
  cross_tenant_support: 'cross_tenant_support',
  chat_assignment: 'chat_assignment',
} as const;

export type AuditEventType = (typeof AUDIT_EVENT_TYPES)[keyof typeof AUDIT_EVENT_TYPES];
