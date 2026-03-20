import { describe, expect, it } from 'vitest';
import { ApiError, parseApiError } from './errors';

describe('parseApiError', () => {
  it('returns ApiError with code and details when body matches schema', async () => {
    const res = {
      status: 400,
      statusText: 'Bad Request',
      text: () =>
        Promise.resolve(
          JSON.stringify({ code: 'VALIDATION', message: 'Invalid input', details: { x: 1 } })
        ),
    } as Response;

    const err = await parseApiError(res);
    expect(err).toBeInstanceOf(ApiError);
    expect(err.message).toBe('Invalid input');
    expect(err.status).toBe(400);
    expect(err.code).toBe('VALIDATION');
    expect(err.details).toEqual({ x: 1 });
    expect(err.body).toContain('VALIDATION');
  });

  it('returns generic ApiError when JSON does not match schema', async () => {
    const res = {
      status: 502,
      statusText: 'Bad Gateway',
      text: () => Promise.resolve(JSON.stringify({ foo: 'bar' })),
    } as Response;

    const err = await parseApiError(res);
    expect(err.code).toBe('UNKNOWN');
    expect(err.status).toBe(502);
  });

  it('handles empty body without throwing', async () => {
    const res = {
      status: 500,
      statusText: 'Internal Server Error',
      text: () => Promise.resolve(''),
    } as Response;

    const err = await parseApiError(res);
    expect(err).toBeInstanceOf(ApiError);
    expect(err.status).toBe(500);
  });
});
