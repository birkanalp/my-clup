import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { platformGymsListResponseSchema } from '@myclup/contracts';
import { GET } from './route';

vi.mock('@/src/server/platform/gate', () => ({
  requirePlatformOperator: vi.fn(),
}));

vi.mock('@/src/server/platform/data', () => ({
  listPlatformGyms: vi.fn(),
}));

import { requirePlatformOperator } from '@/src/server/platform/gate';
import { listPlatformGyms } from '@/src/server/platform/data';

const mockGate = vi.mocked(requirePlatformOperator);
const mockList = vi.mocked(listPlatformGyms);

describe('GET /api/v1/platform/gyms', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when gate fails', async () => {
    mockGate.mockResolvedValue({ ok: false, status: 401, error: 'unauthorized' });
    const req = new NextRequest('http://localhost:3002/api/v1/platform/gyms');
    const res = await GET(req);
    expect(res.status).toBe(401);
  });

  it('returns validated gym list when authorized', async () => {
    mockGate.mockResolvedValue({ ok: true, userId: '00000000-0000-4000-8000-000000000099' });
    mockList.mockResolvedValue({
      gyms: [
        {
          id: '00000000-0000-4000-8000-000000000001',
          name: 'Gym A',
          slug: 'gym-a',
          is_active: true,
          is_published: true,
          city: null,
          country: null,
          created_at: '2026-01-01T00:00:00.000Z',
        },
      ],
    });

    const req = new NextRequest('http://localhost:3002/api/v1/platform/gyms');
    const res = await GET(req);
    expect(res.status).toBe(200);
    const json = (await res.json()) as unknown;
    const parsed = platformGymsListResponseSchema.safeParse(json);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.gyms).toHaveLength(1);
      expect(parsed.data.gyms[0].slug).toBe('gym-a');
    }
  });
});
