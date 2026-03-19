import type { ProfilePatchRequest, WhoamiResponse } from '@myclup/api-client';
import type { SupportedLocale } from '@myclup/types';

export type ProfileFormValues = {
  avatarUrl: string;
  displayName: string;
  locale: SupportedLocale;
};

export function buildProfilePatchInput(
  values: ProfileFormValues,
  currentProfile: WhoamiResponse['profile']
): ProfilePatchRequest | null {
  const nextDisplayName = values.displayName.trim();
  const nextAvatarUrl = values.avatarUrl.trim() === '' ? null : values.avatarUrl.trim();
  const nextLocale = values.locale;

  const patch: ProfilePatchRequest = {};

  if (nextDisplayName !== currentProfile.displayName) {
    patch.displayName = nextDisplayName;
  }

  if (nextAvatarUrl !== currentProfile.avatarUrl) {
    patch.avatarUrl = nextAvatarUrl;
  }

  if (nextLocale !== currentProfile.localePreference.locale) {
    patch.localePreference = {
      ...currentProfile.localePreference,
      locale: nextLocale,
    };
  }

  return Object.keys(patch).length > 0 ? patch : null;
}
