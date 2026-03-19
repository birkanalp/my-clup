import { describe, it, expect, vi, beforeEach } from 'vitest';
import { writeAuditEvent } from './write-audit-event';
import { AUDIT_EVENT_TYPES } from './event-types';
import type { ServerSupabaseClient } from '../client/create-server-client';

function createMockClient(overrides?: {
  data?: { id: string } | null;
  error?: { message: string } | null;
}): ServerSupabaseClient & { insertMock: ReturnType<typeof vi.fn> } {
  const single = vi.fn().mockResolvedValue({
    data: overrides?.data ?? { id: 'audit-event-id-123' },
    error: overrides?.error ?? null,
  });
  const select = vi.fn().mockReturnValue({ single });
  const insertMock = vi.fn().mockReturnValue({ select });
  const from = vi.fn().mockReturnValue({ insert: insertMock });

  return Object.assign({ from }, { insertMock }) as unknown as ServerSupabaseClient & {
    insertMock: ReturnType<typeof vi.fn>;
  };
}

describe('writeAuditEvent', () => {
  const baseParams = {
    event_type: AUDIT_EVENT_TYPES.role_change,
    actor_id: 'actor-uuid-123',
    target_type: 'user_role_assignments',
    target_id: 'target-uuid-456',
    payload: {
      assignment_type: 'user_role_assignments' as const,
      previous_role: 'gym_staff',
      new_role: 'gym_manager',
      reason: 'Promotion',
    },
    tenant_context: { gym_id: 'gym-uuid', branch_id: 'branch-uuid' },
  };

  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('inserts row into audit_events and returns id', async () => {
    const client = createMockClient();
    const id = await writeAuditEvent(client, baseParams);

    expect(id).toBe('audit-event-id-123');
    expect(client.from).toHaveBeenCalledWith('audit_events');
    const insertCall = client.insertMock.mock.calls[0][0];
    expect(insertCall).toMatchObject({
      event_type: 'role_change',
      actor_id: 'actor-uuid-123',
      target_type: 'user_role_assignments',
      target_id: 'target-uuid-456',
      payload: baseParams.payload,
      tenant_context: baseParams.tenant_context,
    });
  });

  it('throws when payload fails schema validation', async () => {
    const client = createMockClient();
    await expect(
      writeAuditEvent(client, {
        ...baseParams,
        payload: { invalid: 'missing new_role' },
      })
    ).rejects.toThrow(/Audit payload validation failed for role_change/);

    expect(client.from).not.toHaveBeenCalled();
  });

  it('returns null when insert fails', async () => {
    const client = createMockClient({
      data: null,
      error: { message: 'RLS policy violation' },
    });
    const id = await writeAuditEvent(client, baseParams);

    expect(id).toBeNull();
  });

  it('accepts admin_impersonation event with valid payload', async () => {
    const client = createMockClient();
    const impersonatedUserId = '550e8400-e29b-41d4-a716-446655440000';
    const id = await writeAuditEvent(client, {
      event_type: AUDIT_EVENT_TYPES.admin_impersonation,
      actor_id: 'admin-uuid',
      target_type: 'auth.users',
      target_id: impersonatedUserId,
      payload: {
        impersonated_user_id: impersonatedUserId,
        action: 'start',
      },
      tenant_context: {},
    });

    expect(id).toBe('audit-event-id-123');
  });
});
