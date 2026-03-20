import { describe, expect, it } from 'vitest';
import { PaginationRequestSchema, PaginationResponseSchema } from './pagination';

describe('PaginationRequestSchema', () => {
  it('parses empty object (all optional)', () => {
    expect(PaginationRequestSchema.parse({})).toEqual({});
  });

  it('accepts optional cursor', () => {
    expect(PaginationRequestSchema.parse({ cursor: 'abc' })).toEqual({ cursor: 'abc' });
  });

  it('accepts valid limit', () => {
    expect(PaginationRequestSchema.parse({ limit: 50 })).toEqual({ limit: 50 });
  });

  it('rejects non-positive limit', () => {
    expect(PaginationRequestSchema.safeParse({ limit: 0 }).success).toBe(false);
    expect(PaginationRequestSchema.safeParse({ limit: -3 }).success).toBe(false);
  });

  it('rejects limit over 100', () => {
    expect(PaginationRequestSchema.safeParse({ limit: 101 }).success).toBe(false);
  });
});

describe('PaginationResponseSchema', () => {
  it('requires has_more and next_cursor', () => {
    expect(
      PaginationResponseSchema.parse({
        next_cursor: null,
        has_more: false,
      })
    ).toEqual({ next_cursor: null, has_more: false });
  });

  it('accepts optional total', () => {
    expect(
      PaginationResponseSchema.parse({
        next_cursor: 'x',
        has_more: true,
        total: 42,
      })
    ).toEqual({ next_cursor: 'x', has_more: true, total: 42 });
  });

  it('rejects missing has_more', () => {
    expect(PaginationResponseSchema.safeParse({ next_cursor: null }).success).toBe(false);
  });
});
