import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { contactLeadResponseSchema } from '@myclup/contracts';
import { POST } from './route';

vi.mock('@/server/contact-lead', () => ({
  persistContactLead: vi.fn(),
}));

import { persistContactLead } from '@/server/contact-lead';

const mockPersist = vi.mocked(persistContactLead);

describe('POST /api/v1/public/contact-leads', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 200 and contract body when persist succeeds', async () => {
    mockPersist.mockResolvedValue({
      ok: true,
      id: '00000000-0000-4000-8000-000000000001',
    });

    const req = new NextRequest('http://localhost:3000/api/v1/public/contact-leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Ada',
        email: 'ada@example.com',
        message: 'Hi',
        locale: 'en',
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const json = (await res.json()) as unknown;
    const parsed = contactLeadResponseSchema.safeParse(json);
    expect(parsed.success).toBe(true);
    if (parsed.success && parsed.data.ok) {
      expect(parsed.data.id).toBe('00000000-0000-4000-8000-000000000001');
    }
  });

  it('returns 400 when body invalid', async () => {
    const req = new NextRequest('http://localhost:3000/api/v1/public/contact-leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'bad' }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    expect(mockPersist).not.toHaveBeenCalled();
  });
});
