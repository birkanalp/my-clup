import { describe, it, expect } from 'vitest';
import { PingRequestSchema, PingResponseSchema, pingContract } from './ping';

describe('ping contract', () => {
  describe('PingRequestSchema', () => {
    it('validates empty object', () => {
      expect(PingRequestSchema.parse({})).toEqual({});
    });

    it('strips unknown keys (empty request)', () => {
      const result = PingRequestSchema.safeParse({ foo: 'bar' });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual({});
      }
    });
  });

  describe('PingResponseSchema', () => {
    it('validates correct response', () => {
      const valid = {
        status: 'ok' as const,
        timestamp: '2025-03-18T12:00:00.000Z',
      };
      expect(PingResponseSchema.parse(valid)).toEqual(valid);
    });

    it('rejects invalid status', () => {
      const result = PingResponseSchema.safeParse({
        status: 'error',
        timestamp: '2025-03-18T12:00:00.000Z',
      });
      expect(result.success).toBe(false);
    });

    it('rejects invalid timestamp format', () => {
      const result = PingResponseSchema.safeParse({
        status: 'ok',
        timestamp: 'not-a-datetime',
      });
      expect(result.success).toBe(false);
    });

    it('rejects missing required fields', () => {
      expect(PingResponseSchema.safeParse({})).toMatchObject({ success: false });
      expect(PingResponseSchema.safeParse({ status: 'ok' })).toMatchObject({
        success: false,
      });
      expect(PingResponseSchema.safeParse({ timestamp: '2025-03-18T12:00:00.000Z' })).toMatchObject(
        {
          success: false,
        }
      );
    });
  });

  describe('pingContract', () => {
    it('has correct path and method', () => {
      expect(pingContract.path).toBe('/api/v1/health/ping');
      expect(pingContract.method).toBe('GET');
    });

    it('exposes request and response schemas', () => {
      expect(pingContract.request).toBe(PingRequestSchema);
      expect(pingContract.response).toBe(PingResponseSchema);
    });
  });
});
