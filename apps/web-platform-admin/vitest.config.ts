import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const packagesRoot = path.resolve(__dirname, '../../packages');

export default defineConfig({
  esbuild: {
    jsx: 'automatic',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname),
      // Resolve workspace packages from source since dist may not be built
      '@myclup/supabase': path.resolve(packagesRoot, 'supabase/src/index.ts'),
      '@myclup/contracts/auth': path.resolve(packagesRoot, 'contracts/src/auth/index.ts'),
      '@myclup/contracts/health': path.resolve(packagesRoot, 'contracts/src/health/index.ts'),
      '@myclup/contracts/common': path.resolve(packagesRoot, 'contracts/src/common/index.ts'),
      '@myclup/contracts/chat': path.resolve(packagesRoot, 'contracts/src/chat/index.ts'),
      '@myclup/contracts/membership': path.resolve(
        packagesRoot,
        'contracts/src/membership/index.ts'
      ),
      '@myclup/contracts/bookings': path.resolve(packagesRoot, 'contracts/src/bookings/index.ts'),
      '@myclup/contracts/billing': path.resolve(packagesRoot, 'contracts/src/billing/index.ts'),
      '@myclup/contracts/addons': path.resolve(packagesRoot, 'contracts/src/addons/index.ts'),
      '@myclup/contracts': path.resolve(packagesRoot, 'contracts/src/index.ts'),
      '@myclup/types': path.resolve(packagesRoot, 'types/src/index.ts'),
      '@myclup/i18n': path.resolve(packagesRoot, 'i18n/src/index.ts'),
      '@myclup/utils': path.resolve(packagesRoot, 'utils/src/index.ts'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: [path.resolve(__dirname, 'src/test/setup.ts')],
    include: ['**/*.test.ts', '**/*.test.tsx'],
    env: {
      NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
      SUPABASE_SERVICE_ROLE_KEY: 'test-service-role-key',
    },
  },
});
