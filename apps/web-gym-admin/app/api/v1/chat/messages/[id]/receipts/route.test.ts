/**
 * Integration tests for PATCH /api/v1/chat/messages/:id/receipts — Mark message as read.
 *
 * Task 17.11, Issue #107 — Read state verification.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { MessageReceiptUpdateSchema } from '@myclup/contracts/chat';
import { ForbiddenError, NotFoundError } from '@myclup/supabase';

vi.mock('@/src/server/chat/receipts', () => ({
  markRead: vi.fn(),
}));

import { PATCH } from './route';
import * as receiptsServer from '@/src/server/chat/receipts';

const mockMarkRead = vi.mocked(receiptsServer.markRead);

const MSG_ID = '550e8400-e29b-41d4-a716-446655440010';

describe('PATCH /api/v1/chat/messages/:id/receipts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when unauthenticated', async () => {
    mockMarkRead.mockResolvedValue(null);

    const request = new NextRequest(
      `http://localhost:3001/api/v1/chat/messages/${MSG_ID}/receipts`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      }
    );
    const response = await PATCH(request, { params: Promise.resolve({ id: MSG_ID }) });

    expect(response.status).toBe(401);
  });

  it('returns 403 when user is not participant', async () => {
    mockMarkRead.mockRejectedValue(new ForbiddenError('Not a participant in this conversation'));

    const request = new NextRequest(
      `http://localhost:3001/api/v1/chat/messages/${MSG_ID}/receipts`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer test-token',
        },
        body: JSON.stringify({}),
      }
    );
    const response = await PATCH(request, { params: Promise.resolve({ id: MSG_ID }) });

    expect(response.status).toBe(403);
  });

  it('returns 403 when user has no tenant access (cross-tenant denial)', async () => {
    mockMarkRead.mockRejectedValue(new ForbiddenError('No access to this gym'));

    const request = new NextRequest(
      `http://localhost:3001/api/v1/chat/messages/${MSG_ID}/receipts`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer test-token',
        },
        body: JSON.stringify({}),
      }
    );
    const response = await PATCH(request, { params: Promise.resolve({ id: MSG_ID }) });

    expect(response.status).toBe(403);
  });

  it('returns 404 when message does not exist', async () => {
    mockMarkRead.mockRejectedValue(new NotFoundError('Message not found'));

    const request = new NextRequest(
      `http://localhost:3001/api/v1/chat/messages/${MSG_ID}/receipts`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer test-token',
        },
        body: JSON.stringify({}),
      }
    );
    const response = await PATCH(request, { params: Promise.resolve({ id: MSG_ID }) });

    expect(response.status).toBe(404);
  });

  it('returns 200 with readAt when marked as read', async () => {
    const readAt = '2024-01-01T12:05:00.000Z';
    mockMarkRead.mockResolvedValue({ readAt });

    const request = new NextRequest(
      `http://localhost:3001/api/v1/chat/messages/${MSG_ID}/receipts`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer test-token',
        },
        body: JSON.stringify({}),
      }
    );
    const response = await PATCH(request, { params: Promise.resolve({ id: MSG_ID }) });

    expect(response.status).toBe(200);
    const json = (await response.json()) as unknown;
    const parsed = MessageReceiptUpdateSchema.safeParse(json);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.readAt).toBe(readAt);
    }
    expect(mockMarkRead).toHaveBeenCalledWith(request, MSG_ID);
  });

  it('read state: per-participant receipt upsert is invoked', async () => {
    mockMarkRead.mockResolvedValue({ readAt: '2024-01-01T12:05:00.000Z' });

    const request = new NextRequest(
      `http://localhost:3001/api/v1/chat/messages/${MSG_ID}/receipts`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer test-token',
        },
        body: JSON.stringify({}),
      }
    );
    await PATCH(request, { params: Promise.resolve({ id: MSG_ID }) });

    expect(mockMarkRead).toHaveBeenCalledTimes(1);
    expect(mockMarkRead).toHaveBeenCalledWith(request, MSG_ID);
  });
});
