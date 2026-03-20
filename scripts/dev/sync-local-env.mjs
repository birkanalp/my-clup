import {
  getDemoCredentials,
  getManagedSupabaseEnv,
  getSupabaseStatusEnv,
  readEnvFile,
  writeEnvFile,
} from './local-supabase.mjs';

const defaultSharedEnv = {
  NODE_ENV: 'development',
  EXPO_PUBLIC_API_BASE_URL: 'http://localhost:3001',
  NEXT_PUBLIC_SITE_URL: 'http://localhost:3000',
  NEXT_PUBLIC_DEFAULT_LOCALE: 'en',
  NEXT_PUBLIC_SUPPORTED_LOCALES: 'en,tr',
  NEXT_PUBLIC_FALLBACK_LOCALE: 'en',
  NEXT_PUBLIC_LOCALE_URL_STRATEGY: 'path',
  OLLAMA_BASE_URL: 'http://localhost:11434',
  OLLAMA_MODEL: 'qwen2:0.5b-instruct',
  OLLAMA_TIMEOUT_MS: '10000',
  AI_FEATURE_FLAG: 'enabled',
};

function mergeEnv(pathname, managedEntries) {
  const existing = readEnvFile(pathname);
  writeEnvFile(pathname, {
    ...existing,
    ...managedEntries,
  });
}

const statusEnv = getSupabaseStatusEnv();
const managedSupabaseEnv = getManagedSupabaseEnv(statusEnv);
const credentials = getDemoCredentials();

mergeEnv('.env.local', {
  ...defaultSharedEnv,
  ...managedSupabaseEnv,
});

mergeEnv('apps/web-gym-admin/.env.local', {
  ...defaultSharedEnv,
  ...managedSupabaseEnv,
  NEXT_PUBLIC_APP_URL: 'http://localhost:3001',
  NEXT_PUBLIC_DEV_USER_EMAIL: credentials.staff.email,
  NEXT_PUBLIC_DEV_USER_PASSWORD: credentials.staff.password,
});

mergeEnv('apps/mobile-user/.env.local', {
  ...defaultSharedEnv,
  EXPO_PUBLIC_SUPABASE_URL: managedSupabaseEnv.NEXT_PUBLIC_SUPABASE_URL,
  EXPO_PUBLIC_SUPABASE_ANON_KEY: managedSupabaseEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  EXPO_PUBLIC_DEV_AUTO_SIGN_IN: 'true',
  EXPO_PUBLIC_DEV_USER_EMAIL: credentials.member.email,
  EXPO_PUBLIC_DEV_USER_PASSWORD: credentials.member.password,
});

mergeEnv('apps/mobile-admin/.env.local', {
  ...defaultSharedEnv,
  EXPO_PUBLIC_SUPABASE_URL: managedSupabaseEnv.NEXT_PUBLIC_SUPABASE_URL,
  EXPO_PUBLIC_SUPABASE_ANON_KEY: managedSupabaseEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  EXPO_PUBLIC_DEV_AUTO_SIGN_IN: 'true',
  EXPO_PUBLIC_DEV_USER_EMAIL: credentials.staff.email,
  EXPO_PUBLIC_DEV_USER_PASSWORD: credentials.staff.password,
});

console.log('Synced local env files for root, web-gym-admin, mobile-user, and mobile-admin.');
