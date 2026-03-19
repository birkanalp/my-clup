/**
 * @myclup/supabase — DB types, shared clients, SQL/RLS conventions, server helpers.
 *
 * ⚠️ SERVER-ONLY PACKAGE
 * Client apps (mobile-user, mobile-admin, web-gym-admin UI, web-platform-admin UI,
 * web-site UI) must NOT import @myclup/supabase. All Supabase access from client
 * surfaces goes through the Next.js BFF and api-client. Only BFF routes, API
 * handlers, server actions, and server modules may use this package.
 *
 * Ownership:
 * - Database type generation outputs (src/generated/)
 * - Server-side Supabase client factory
 * - SQL conventions and RLS guidance
 */

export {
  createServerClient,
  type CreateServerClientOptions,
  type ServerSupabaseClient,
} from './client/index';

export {
  getSession,
  getCurrentUser,
  createUserScopedClient,
  resolveTenantScope,
  checkPermission,
  requirePermission,
  ForbiddenError,
  NotFoundError,
  ROLE_PERMISSIONS,
  type AuthRequest,
  type CurrentUser,
  type Profile,
  type UserScopedSupabaseClient,
  type AnyRole,
} from './auth/index';

export type { Database, Json } from './generated/database.types';

export {
  writeAuditEvent,
  AUDIT_EVENT_TYPES,
  type WriteAuditEventParams,
  type AuditEventType,
} from './audit/index';

export {
  buildChatChannelName,
  parseChatChannelName,
  buildMessageConversationFilter,
  CHAT_CHANNEL_PREFIX,
  CHAT_MESSAGES_POSTGRES_EVENT,
  CHAT_MESSAGES_SCHEMA,
  CHAT_MESSAGES_TABLE,
} from './realtime/index';

export {
  assignMembershipInstance,
  cancelMembership,
  createMembershipPlan,
  deactivateMembershipPlan,
  freezeMembership,
  getMembershipInstance,
  getMembershipPlan,
  listMembershipInstances,
  listMembershipPlans,
  renewMembership,
  updateMembershipPlan,
  validateMembershipAccess,
} from './membership/index';
