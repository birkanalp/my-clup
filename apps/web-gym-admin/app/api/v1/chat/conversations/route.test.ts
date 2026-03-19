/**
 * Integration tests for GET/POST /api/v1/chat/conversations.
 *
 * Task 17.3, Issue #99
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { ListConversationsResponseSchema } from '@myclup/contracts/chat';

vi.mock('@/src/server/chat/conversations', () => ({
  listConversations: vi.fn(),
  createConversation: vi.fn(),
}));

import { GET, POST } from './route';
import * as convServer from '@/src/server/chat/conversations';

const mockListConversations = vi.mocked(convServer.listConversations);
const mockCreateConversation = vi.mocked(convServer.createConversation);

describe('GET /api/v1/chat/conversations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when unauthenticated', async () => {
    mockListConversations.mockResolvedValue(null);

    const request = new NextRequest('http://localhost:3001/api/v1/chat/conversations');
    const response = await GET(request);

    expect(response.status).toBe(401);
  });

  it('returns 200 with cursor-paginated items when authenticated', async () => {
    mockListConversations.mockResolvedValue({
      items: [
        {
          id: '550e8400-e29b-41d4-a716-446655440001',
          gymId: '550e8400-e29b-41d4-a716-446655440000',
          branchId: null,
          type: 'direct',
          metadata: {},
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-02T00:00:00.000Z',
        },
      ],
      nextCursor: null,
    });

    const request = new NextRequest('http://localhost:3001/api/v1/chat/conversations', {
      headers: { Authorization: 'Bearer test-token' },
    });
    const response = await GET(request);

    expect(response.status).toBe(200);
    const json = (await response.json()) as unknown;
    const parsed = ListConversationsResponseSchema.safeParse(json);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.items).toHaveLength(1);
      expect(parsed.data.items[0].id).toBe('550e8400-e29b-41d4-a716-446655440001');
      expect(parsed.data.nextCursor).toBeNull();
    }
  });
});

describe('POST /api/v1/chat/conversations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when unauthenticated', async () => {
    mockCreateConversation.mockResolvedValue(null);

    const request = new NextRequest('http://localhost:3001/api/v1/chat/conversations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        gymId: '550e8400-e29b-41d4-a716-446655440000',
        type: 'direct',
        participantUserIds: ['550e8400-e29b-41d4-a716-446655440001'],
      }),
    });
    const response = await POST(request);

    expect(response.status).toBe(401);
  });

  it('returns 400 for invalid request body', async () => {
    const request = new NextRequest('http://localhost:3001/api/v1/chat/conversations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        gymId: '550e8400-e29b-41d4-a716-446655440000',
        type: 'invalid-type',
        participantUserIds: [],
      }),
    });
    const response = await POST(request);

    expect(response.status).toBe(400);
  });

  it('returns 200 with created conversation when authenticated and valid input', async () => {
    mockCreateConversation.mockResolvedValue({
      id: '550e8400-e29b-41d4-a716-446655440002',
      gymId: '550e8400-e29b-41d4-a716-446655440000',
      branchId: null,
      type: 'direct',
      metadata: {},
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    });

    const input = {
      gymId: '550e8400-e29b-41d4-a716-446655440000',
      type: 'direct' as const,
      participantUserIds: ['550e8400-e29b-41d4-a716-446655440001'],
    };
    const request = new NextRequest('http://localhost:3001/api/v1/chat/conversations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer test-token',
      },
      body: JSON.stringify(input),
    });
    const response = await POST(request);

    expect(response.status).toBe(200);
    const json = (await response.json()) as { id: string };
    expect(json.id).toBe('550e8400-e29b-41d4-a716-446655440002');
    expect(mockCreateConversation).toHaveBeenCalledWith(request, input);
  });
});
