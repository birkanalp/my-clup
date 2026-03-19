/**
 * Integration tests for PATCH /api/v1/auth/profile.
 *
 * Tests authentication gate, input validation, and response shape.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { ProfilePatchResponseSchema } from '@myclup/contracts/auth';

// Mock the profile server module
vi.mock('@/src/server/auth/profile', () => ({
  patchProfile: vi.fn(),
}));

import { PATCH } from './route';
import * as profileServer from '@/src/server/auth/profile';

const mockPatchProfile = vi.mocked(profileServer.patchProfile);

const MOCK_PROFILE_RESPONSE = {
  userId: 'user-1',
  displayName: 'Updated Name',
  avatarUrl: null,
  localePreference: { locale: 'en' as const },
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-02T00:00:00Z',
};

describe('PATCH /api/v1/auth/profile', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when unauthenticated (server module returns null)', async () => {
    mockPatchProfile.mockResolvedValue(null);

    const request = new NextRequest('http://localhost:3001/api/v1/auth/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ displayName: 'New Name' }),
    });

    const response = await PATCH(request);

    expect(response.status).toBe(401);
  });

  it('returns 400 for invalid request body', async () => {
    const request = new NextRequest('http://localhost:3001/api/v1/auth/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ displayName: '' }), // empty string fails min(1)
    });

    const response = await PATCH(request);

    expect(response.status).toBe(400);
    const json = (await response.json()) as { error: string };
    expect(json.error).toBe('validation_error');
  });

  it('returns 200 with updated profile when authenticated and input is valid', async () => {
    mockPatchProfile.mockResolvedValue(MOCK_PROFILE_RESPONSE);

    const request = new NextRequest('http://localhost:3001/api/v1/auth/profile', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer test-token',
      },
      body: JSON.stringify({ displayName: 'Updated Name' }),
    });

    const response = await PATCH(request);

    expect(response.status).toBe(200);
    const json = (await response.json()) as unknown;
    const parsed = ProfilePatchResponseSchema.safeParse(json);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.displayName).toBe('Updated Name');
      expect(parsed.data.userId).toBe('user-1');
    }
  });

  it('passes validated input to the server module', async () => {
    mockPatchProfile.mockResolvedValue(MOCK_PROFILE_RESPONSE);

    const input = { displayName: 'New Name', localePreference: { locale: 'en' as const } };
    const request = new NextRequest('http://localhost:3001/api/v1/auth/profile', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer test-token',
      },
      body: JSON.stringify(input),
    });

    await PATCH(request);

    expect(mockPatchProfile).toHaveBeenCalledWith(request, input);
  });
});
