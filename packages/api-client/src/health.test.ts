import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createApi } from './index';

describe('api-client health.ping', () => {
  let mockFetch: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockFetch = vi.fn();
  });

  it('parses valid response correctly', async () => {
    const validResponse = {
      status: 'ok',
      timestamp: '2025-03-18T12:00:00.000Z',
    };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(validResponse),
    });

    const api = createApi({
      baseUrl: 'https://api.example.com',
      fetch: mockFetch,
    });

    const result = await api.health.ping();

    expect(result).toEqual(validResponse);
    expect(result.status).toBe('ok');
    expect(result.timestamp).toBe('2025-03-18T12:00:00.000Z');
    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.example.com/api/v1/health/ping',
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
        }),
      })
    );
  });

  it('throws on invalid response shape', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ status: 'invalid', foo: 'bar' }),
    });

    const api = createApi({
      baseUrl: 'https://api.example.com',
      fetch: mockFetch,
    });

    await expect(api.health.ping()).rejects.toThrow();
  });

  it('throws on non-2xx status', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      text: () => Promise.resolve('Server error'),
    });

    const api = createApi({
      baseUrl: 'https://api.example.com',
      fetch: mockFetch,
    });

    await expect(api.health.ping()).rejects.toMatchObject({
      name: 'ApiError',
      status: 500,
    });
  });

  it('injects optional headers', async () => {
    const validResponse = {
      status: 'ok',
      timestamp: '2025-03-18T12:00:00.000Z',
    };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(validResponse),
    });

    const api = createApi({
      baseUrl: 'https://api.example.com',
      headers: { Authorization: 'Bearer token123' },
      fetch: mockFetch,
    });

    await api.health.ping();

    expect(mockFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer token123',
        }),
      })
    );
  });
});
