import type { SupportedLocale } from "./locale";

export interface UserLocalePreference {
  locale: SupportedLocale;
  fallbackLocale?: SupportedLocale;
}

export interface User {
  id: string; // Supabase auth user.id
  email: string | null;
  phone: string | null;
  createdAt: string; // ISO 8601
  updatedAt: string;
}

export interface UserProfile {
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  localePreference: UserLocalePreference;
  createdAt: string;
  updatedAt: string;
}
