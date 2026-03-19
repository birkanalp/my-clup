import { describe, expect, it } from 'vitest';
import { buildProfilePatchInput } from './profileForm';

const currentProfile = {
  userId: 'user-1',
  displayName: 'Jane Doe',
  avatarUrl: 'https://example.com/avatar.png',
  localePreference: { locale: 'en' as const, fallbackLocale: 'tr' as const },
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

describe('buildProfilePatchInput', () => {
  it('returns null when the form does not change any supported field', () => {
    expect(
      buildProfilePatchInput(
        {
          displayName: 'Jane Doe',
          avatarUrl: 'https://example.com/avatar.png',
          locale: 'en',
        },
        currentProfile
      )
    ).toBeNull();
  });

  it('builds a patch for display name and locale changes', () => {
    expect(
      buildProfilePatchInput(
        {
          displayName: 'Jane Coach',
          avatarUrl: 'https://example.com/avatar.png',
          locale: 'tr',
        },
        currentProfile
      )
    ).toEqual({
      displayName: 'Jane Coach',
      localePreference: { locale: 'tr', fallbackLocale: 'tr' },
    });
  });

  it('normalizes an empty avatar field into null', () => {
    expect(
      buildProfilePatchInput(
        {
          displayName: 'Jane Doe',
          avatarUrl: '   ',
          locale: 'en',
        },
        currentProfile
      )
    ).toEqual({
      avatarUrl: null,
    });
  });
});
