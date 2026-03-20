import { describe, expect, it, vi } from 'vitest';
import { fetcher } from './fetcher';
import { ApiError } from './errors';

describe('fetcher', () => {
  it('returns parsed JSON on 2xx', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ a: 1 }),
    });

    const data = await fetcher<{ a: number }>('https://x.test/data', {}, mockFetch);
    expect(data).toEqual({ a: 1 });
  });

  it('sets Content-Type application/json by default', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({}),
    });

    await fetcher('https://x.test/', { method: 'POST', body: '{}' }, mockFetch);
    expect(mockFetch).toHaveBeenCalledWith(
      'https://x.test/',
      expect.objectContaining({
        headers: expect.any(Headers),
      })
    );
    const headers = mockFetch.mock.calls[0][1].headers as Headers;
    expect(headers.get('Content-Type')).toContain('application/json');
  });

  it('sets Accept-Language when locale provided', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({}),
    });

    await fetcher('https://x.test/', { locale: 'tr' }, mockFetch);
    const headers = mockFetch.mock.calls[0][1].headers as Headers;
    expect(headers.get('Accept-Language')).toBe('tr');
  });

  it('does not set Accept-Language when locale omitted', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({}),
    });

    await fetcher('https://x.test/', {}, mockFetch);
    const headers = mockFetch.mock.calls[0][1].headers as Headers;
    expect(headers.get('Accept-Language')).toBeNull();
  });

  it('throws ApiError on non-2xx', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      statusText: 'Not Found',
      text: () => Promise.resolve(''),
    });

    await expect(fetcher('https://x.test/missing', {}, mockFetch)).rejects.toBeInstanceOf(ApiError);
  });
});
