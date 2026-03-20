import { describe, expect, it } from 'vitest';
import { ApiErrorResponseSchema } from './error';

describe('ApiErrorResponseSchema', () => {
  it('parses minimal valid error', () => {
    expect(ApiErrorResponseSchema.parse({ code: 'ERR', message: 'oops' })).toEqual({
      code: 'ERR',
      message: 'oops',
    });
  });

  it('accepts optional details', () => {
    expect(
      ApiErrorResponseSchema.parse({
        code: 'E1',
        message: 'bad',
        details: { field: 'x' },
      })
    ).toEqual({
      code: 'E1',
      message: 'bad',
      details: { field: 'x' },
    });
  });

  it('rejects missing code', () => {
    expect(ApiErrorResponseSchema.safeParse({ message: 'm' }).success).toBe(false);
  });

  it('rejects empty code', () => {
    expect(ApiErrorResponseSchema.safeParse({ code: '', message: 'm' }).success).toBe(false);
  });

  it('rejects empty message', () => {
    expect(ApiErrorResponseSchema.safeParse({ code: 'c', message: '' }).success).toBe(false);
  });
});
