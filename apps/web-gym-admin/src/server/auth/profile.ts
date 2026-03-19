/**
 * Profile update server module.
 *
 * Handles PATCH /api/v1/auth/profile — updates the authenticated user's profile.
 * Validates input against contract schema (done by withContractRoute at the route layer).
 *
 * ⚠️ SERVER-ONLY: Never import in client components or pages.
 */

import type { NextRequest } from 'next/server';
import type { ProfilePatchRequest, ProfilePatchResponse } from '@myclup/contracts/auth';
import { getCurrentUser, createServerClient } from '@myclup/supabase';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

type ProfileRow = {
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  locale: string;
  fallback_locale: string;
  created_at: string;
  updated_at: string;
};

/**
 * Update the authenticated user's profile.
 *
 * @param req - Authenticated Next.js request
 * @param input - Validated PATCH input (from contract schema)
 * @returns Updated ProfilePatchResponse | null (null = unauthenticated)
 */
export async function patchProfile(
  req: NextRequest,
  input: ProfilePatchRequest
): Promise<ProfilePatchResponse | null> {
  const currentUser = await getCurrentUser(req);
  if (!currentUser) return null;

  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) return null;

  const client = createServerClient({
    supabaseUrl: SUPABASE_URL,
    serviceRoleKey: SERVICE_ROLE_KEY,
  });

  // Build update payload — only include fields explicitly provided
  const update: Record<string, string | null> = {};

  if (input.displayName !== undefined) {
    update.display_name = input.displayName;
  }
  if (input.avatarUrl !== undefined) {
    update.avatar_url = input.avatarUrl;
  }
  if (input.localePreference !== undefined) {
    update.locale = input.localePreference.locale;
    if (input.localePreference.fallbackLocale !== undefined) {
      update.fallback_locale = input.localePreference.fallbackLocale;
    }
  }

  const { data, error } = await client
    .from('profiles')
    .update(update)
    .eq('user_id', currentUser.user.id)
    .select('*')
    .single();

  if (error || !data) return null;

  const profile = data as ProfileRow;

  return {
    userId: profile.user_id,
    displayName: profile.display_name,
    avatarUrl: profile.avatar_url,
    localePreference: {
      locale: profile.locale as 'tr' | 'en',
      fallbackLocale: profile.fallback_locale as 'tr' | 'en' | undefined,
    },
    createdAt: profile.created_at,
    updatedAt: profile.updated_at,
  };
}
