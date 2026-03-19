import { describe, it, expect } from 'vitest';
import {
  ProfilePatchRequestSchema,
  ProfilePatchResponseSchema,
  profilePatchContract,
} from './profile';

describe('profile contract', () => {
  describe('ProfilePatchRequestSchema', () => {
    it('accepts empty object (all optional)', () => {
      expect(ProfilePatchRequestSchema.parse({})).toEqual({});
    });

    it('accepts displayName only', () => {
      const input = { displayName: 'New Name' };
      expect(ProfilePatchRequestSchema.parse(input)).toEqual(input);
    });

    it('accepts avatarUrl only', () => {
      const input = { avatarUrl: 'https://example.com/avatar.png' };
      expect(ProfilePatchRequestSchema.parse(input)).toEqual(input);
    });

    it('accepts avatarUrl: null', () => {
      const input = { avatarUrl: null };
      expect(ProfilePatchRequestSchema.parse(input)).toEqual(input);
    });

    it('accepts localePreference only', () => {
      const input = { localePreference: { locale: 'tr' as const } };
      expect(ProfilePatchRequestSchema.parse(input)).toEqual(input);
    });

    it('accepts full localePreference with fallbackLocale', () => {
      const input = {
        localePreference: { locale: 'en' as const, fallbackLocale: 'tr' as const },
      };
      expect(ProfilePatchRequestSchema.parse(input)).toEqual(input);
    });

    it('rejects empty displayName', () => {
      const result = ProfilePatchRequestSchema.safeParse({ displayName: '' });
      expect(result.success).toBe(false);
    });

    it('rejects invalid avatarUrl format', () => {
      const result = ProfilePatchRequestSchema.safeParse({
        avatarUrl: 'not-a-valid-url',
      });
      expect(result.success).toBe(false);
    });

    it('rejects invalid locale', () => {
      const result = ProfilePatchRequestSchema.safeParse({
        localePreference: { locale: 'fr' },
      });
      expect(result.success).toBe(false);
    });
  });

  describe('ProfilePatchResponseSchema', () => {
    const validProfile = {
      userId: 'user-uuid',
      displayName: 'Test User',
      avatarUrl: 'https://example.com/avatar.png',
      localePreference: { locale: 'en' as const, fallbackLocale: 'tr' as const },
      createdAt: '2025-03-18T12:00:00.000Z',
      updatedAt: '2025-03-18T12:00:00.000Z',
    };

    it('validates full UserProfile response', () => {
      expect(ProfilePatchResponseSchema.parse(validProfile)).toEqual(validProfile);
    });

    it('accepts null avatarUrl', () => {
      const withNull = { ...validProfile, avatarUrl: null };
      expect(ProfilePatchResponseSchema.parse(withNull).avatarUrl).toBeNull();
    });

    it('rejects missing required fields', () => {
      expect(ProfilePatchResponseSchema.safeParse({})).toMatchObject({
        success: false,
      });
    });
  });

  describe('profilePatchContract', () => {
    it('has correct path and method', () => {
      expect(profilePatchContract.path).toBe('/api/v1/auth/profile');
      expect(profilePatchContract.method).toBe('PATCH');
    });

    it('exposes request and response schemas', () => {
      expect(profilePatchContract.request).toBe(ProfilePatchRequestSchema);
      expect(profilePatchContract.response).toBe(ProfilePatchResponseSchema);
    });
  });
});
