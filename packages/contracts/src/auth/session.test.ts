import { describe, it, expect } from 'vitest';
import { SessionRequestSchema, SessionResponseSchema, sessionContract } from './session';

describe('session contract', () => {
  describe('SessionRequestSchema', () => {
    it('validates empty object (GET, no body)', () => {
      expect(SessionRequestSchema.parse({})).toEqual({});
    });

    it('strips unknown keys', () => {
      const result = SessionRequestSchema.safeParse({ foo: 'bar' });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual({});
      }
    });
  });

  describe('SessionResponseSchema', () => {
    it('validates valid=true', () => {
      const valid = { valid: true as const };
      expect(SessionResponseSchema.parse(valid)).toEqual(valid);
    });

    it('validates valid=false', () => {
      const invalid = { valid: false as const };
      expect(SessionResponseSchema.parse(invalid)).toEqual(invalid);
    });

    it('rejects invalid valid value', () => {
      const result = SessionResponseSchema.safeParse({ valid: 'yes' });
      expect(result.success).toBe(false);
    });

    it('rejects missing valid field', () => {
      expect(SessionResponseSchema.safeParse({})).toMatchObject({ success: false });
    });

    it('strips unknown keys', () => {
      const result = SessionResponseSchema.safeParse({
        valid: true,
        extra: 'ignored',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual({ valid: true });
      }
    });
  });

  describe('sessionContract', () => {
    it('has correct path and method', () => {
      expect(sessionContract.path).toBe('/api/v1/auth/session');
      expect(sessionContract.method).toBe('GET');
    });

    it('exposes request and response schemas', () => {
      expect(sessionContract.request).toBe(SessionRequestSchema);
      expect(sessionContract.response).toBe(SessionResponseSchema);
    });
  });
});
