import { defineConfig, devices } from '@playwright/test';

/**
 * E2E: multi-app projects (Tasks #238–#240).
 * Run against local dev servers, e.g.:
 *   pnpm dev:web-gym-admin  # :3001
 *   Platform admin          # :3002
 *   Web site                # :3000
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  timeout: 60_000,
  use: {
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'web-site',
      testMatch: /web-site\/.*\.spec\.ts/,
      use: {
        baseURL: process.env.E2E_WEB_SITE_URL ?? 'http://localhost:3000',
        ...devices['Desktop Chrome'],
      },
    },
    {
      name: 'web-gym-admin',
      testMatch: /gym-admin\/.*\.spec\.ts/,
      use: {
        baseURL: process.env.E2E_WEB_GYM_ADMIN_URL ?? 'http://localhost:3001',
        ...devices['Desktop Chrome'],
      },
    },
    {
      name: 'web-platform-admin',
      testMatch: /platform-admin\/.*\.spec\.ts/,
      use: {
        baseURL: process.env.E2E_WEB_PLATFORM_ADMIN_URL ?? 'http://localhost:3002',
        ...devices['Desktop Chrome'],
      },
    },
  ],
});
