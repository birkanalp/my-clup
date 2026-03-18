# Contributing to MyClup

## Environment Setup

### Required Variables

1. Copy `.env.example` to `.env` or `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Fill in the placeholder values. The example file documents three categories:

   | Category | Description | Example |
   |----------|-------------|---------|
   | **App public** | Safe for client bundles (`NEXT_PUBLIC_*`, `EXPO_PUBLIC_*`) | `NEXT_PUBLIC_SUPABASE_URL` |
   | **Shared runtime** | Non-secret, server or build-time | `NODE_ENV`, `NEXT_PUBLIC_DEFAULT_LOCALE` |
   | **Secret server-only** | Never expose to clients | `SUPABASE_SERVICE_ROLE_KEY` |

3. **Secrets** (Supabase keys, OAuth secrets, webhook secrets) must never be committed. They are gitignored via `.env`, `.env.local`, `.env.development`, `.env.production`, and `.env.*.local`.

### Localization Variables

For multilingual delivery, configure:

- `NEXT_PUBLIC_DEFAULT_LOCALE` — Default when none specified (e.g. `en`)
- `NEXT_PUBLIC_SUPPORTED_LOCALES` — Comma-separated (e.g. `en,tr`)
- `NEXT_PUBLIC_FALLBACK_LOCALE` — Fallback when a translation is missing
- `NEXT_PUBLIC_LOCALE_URL_STRATEGY` — Website URL strategy: `path`, `domain`, or `subdomain`

### CI Usage

In CI, inject secrets via your platform's secret manager (e.g. GitHub Actions secrets). Do not check in `.env` files. Use `.env.example` as the reference for required keys.

## Testing

### Unit tests (Vitest)

- Run `pnpm run test` at root (uses Turborepo).
- Shared packages use Vitest; see `packages/utils` for an example.

### E2E (Playwright)

- `playwright.config.ts` exists at root as a skeleton.
- Add E2E tests when Next.js apps exist (Epic #14+).
- Run with `pnpm exec playwright test` from root.

### Mobile (React Native Testing Library)

- For Expo apps, use [React Native Testing Library](https://callstack.github.io/react-native-testing-library/) for component and flow tests.
- RTL integrates with Jest (or Vitest via `@vitest/coverage-v8`).
- Add RTL tests when `apps/mobile-user` and `apps/mobile-admin` are scaffolded.
