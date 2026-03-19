/**
 * Audit logging: inserts into audit_events for sensitive operations.
 *
 * Uses service role client (audit_events has no public read; insert-only for service_role).
 * Caller must pass actor_id (e.g. from getCurrentUser) and tenant_context.
 *
 * @see FLOWS.md for which flows must call writeAuditEvent
 */

import type { Database, Json } from '../generated/database.types';
import type { ServerSupabaseClient } from '../client/create-server-client';
import { PAYLOAD_SCHEMAS } from './schemas';
import type { AuditEventType } from './event-types';
import type { TenantContext } from './schemas';

export interface WriteAuditEventParams {
  /** Event type (use AUDIT_EVENT_TYPES constants) */
  event_type: AuditEventType;
  /** User who performed the action (Supabase auth.users.id); nullable for system events */
  actor_id: string | null;
  /** Target entity type (e.g. user_role_assignments, membership, payment) */
  target_type: string;
  /** Target entity UUID; nullable when no single target */
  target_id: string | null;
  /** Event-specific payload; will be validated against schema if defined */
  payload: Record<string, unknown>;
  /** Gym/branch context for tenant-scoped events */
  tenant_context: TenantContext;
}

/**
 * Writes an audit event to audit_events.
 *
 * Uses service role client for insert. Payload is validated against the
 * event-specific schema when defined; invalid payloads throw.
 *
 * @param client - Server Supabase client (service role)
 * @param params - Event params
 * @returns Inserted row id or null on failure (errors are logged, not thrown, to avoid blocking flows)
 */
export async function writeAuditEvent(
  client: ServerSupabaseClient,
  params: WriteAuditEventParams
): Promise<string | null> {
  const { event_type, actor_id, target_type, target_id, payload, tenant_context } = params;

  const schema = PAYLOAD_SCHEMAS[event_type];
  if (schema) {
    const parsed = schema.safeParse(payload);
    if (!parsed.success) {
      throw new Error(`Audit payload validation failed for ${event_type}: ${parsed.error.message}`);
    }
  }

  const row: Database['public']['Tables']['audit_events']['Insert'] = {
    event_type,
    actor_id,
    target_type,
    target_id,
    payload: payload as Json,
    tenant_context: tenant_context as Json,
  };

  const { data, error } = await client.from('audit_events').insert(row).select('id').single();

  if (error) {
    console.error('[audit] writeAuditEvent failed:', error);
    return null;
  }

  return (data as { id: string } | null)?.id ?? null;
}
