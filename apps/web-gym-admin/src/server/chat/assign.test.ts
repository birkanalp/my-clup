/**
 * Unit tests for assignConversation — assignment audit integration.
 *
 * Task 17.7, Issue #103
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { assignConversation } from './assign';

vi.mock('@myclup/supabase', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@myclup/supabase')>();
  return {
    ...actual,
    getCurrentUser: vi.fn(),
    createServerClient: vi.fn(),
    requirePermission: vi.fn(),
    writeAuditEvent: vi.fn(),
    AUDIT_EVENT_TYPES: {
      ...actual.AUDIT_EVENT_TYPES,
      chat_assignment: 'chat_assignment',
    },
  };
});

import * as supabase from '@myclup/supabase';

/** Minimal User-shaped mock for getCurrentUser; satisfies CurrentUser['user'] */
const mockUser = {
  id: 'user-actor',
  app_metadata: {},
  user_metadata: {},
  aud: 'authenticated',
  created_at: '2024-01-01T00:00:00Z',
} as supabase.CurrentUser['user'];

const mockGetCurrentUser = vi.mocked(supabase.getCurrentUser);
const mockCreateServerClient = vi.mocked(supabase.createServerClient);
const mockRequirePermission = vi.mocked(supabase.requirePermission);
const mockWriteAuditEvent = vi.mocked(supabase.writeAuditEvent);

function createMockClient() {
  const from = vi.fn().mockImplementation((table: string) => {
    if (table === 'conversations') {
      return {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: {
                id: 'conv-123',
                gym_id: 'gym-456',
                branch_id: 'branch-789',
              },
              error: null,
            }),
          }),
        }),
      };
    }
    if (table === 'conversation_assignments') {
      const selectChain = {
        eq: vi.fn().mockReturnThis(),
        is: vi.fn().mockResolvedValue({
          data: [],
          error: null,
        }),
      };
      const updateChain = {
        eq: vi.fn().mockReturnThis(),
        is: vi.fn().mockResolvedValue({ data: null, error: null }),
      };
      const insertChain = {
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: {
              id: 'assign-123',
              conversation_id: 'conv-123',
              assigned_to_user_id: 'user-new',
              assigned_at: '2024-01-01T12:00:00.000Z',
              assigned_by_user_id: 'user-actor',
              unassigned_at: null,
            },
            error: null,
          }),
        }),
      };
      return {
        select: vi.fn().mockReturnValue(selectChain),
        update: vi.fn().mockReturnValue(updateChain),
        insert: vi.fn().mockReturnValue(insertChain),
      };
    }
    return {};
  });
  return { from };
}

describe('assignConversation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetCurrentUser.mockResolvedValue({
      user: mockUser,
      profile: {} as supabase.Profile,
    });
    const mockClient = createMockClient();
    mockCreateServerClient.mockReturnValue(mockClient as never);
    mockRequirePermission.mockResolvedValue(undefined);
    mockWriteAuditEvent.mockResolvedValue('audit-id');
  });

  it('writes audit event with chat_assignment after successful assign', async () => {
    const req = new NextRequest('http://localhost/api');
    const result = await assignConversation(req, 'conv-123', {
      assignedToUserId: 'user-new',
    });

    expect(result).not.toBeNull();
    expect(mockWriteAuditEvent).toHaveBeenCalledTimes(1);
    expect(mockWriteAuditEvent).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        event_type: 'chat_assignment',
        actor_id: 'user-actor',
        target_type: 'conversation_assignments',
        target_id: 'assign-123',
        payload: expect.objectContaining({
          assigned_by_user_id: 'user-actor',
          assigned_to_user_id: 'user-new',
          assignment_id: 'assign-123',
        }),
        tenant_context: expect.objectContaining({
          gym_id: 'gym-456',
          branch_id: 'branch-789',
        }),
      })
    );
  });

  it('includes assigned_from_user_id when reassigning from previous assignee', async () => {
    const mockClient = createMockClient();
    mockCreateServerClient.mockReturnValue(mockClient as never);

    const fromFn = mockClient.from as ReturnType<typeof vi.fn>;
    fromFn.mockImplementation((table: string) => {
      if (table === 'conversations') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: { id: 'conv-123', gym_id: 'gym-456', branch_id: 'branch-789' },
                error: null,
              }),
            }),
          }),
        };
      }
      if (table === 'conversation_assignments') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              is: vi.fn().mockResolvedValue({
                data: [{ assigned_to_user_id: 'user-previous' }],
                error: null,
              }),
            }),
          }),
          update: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              is: vi.fn().mockResolvedValue({ data: null, error: null }),
            }),
          }),
          insert: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: {
                  id: 'assign-456',
                  conversation_id: 'conv-123',
                  assigned_to_user_id: 'user-new',
                  assigned_at: '2024-01-01T12:00:00.000Z',
                  assigned_by_user_id: 'user-actor',
                  unassigned_at: null,
                },
                error: null,
              }),
            }),
          }),
        };
      }
      return {};
    });

    const req = new NextRequest('http://localhost/api');
    await assignConversation(req, 'conv-123', { assignedToUserId: 'user-new' });

    expect(mockWriteAuditEvent).toHaveBeenCalledTimes(1);
    const [, params] = mockWriteAuditEvent.mock.calls[0];
    expect(params.payload.assigned_from_user_id).toBe('user-previous');
  });
});
