# Web Gym Admin (`apps/web-gym-admin`) — QA and localization acceptance

This document satisfies **#177** (Epic #32). It complements `docs/07-technical-plan.md` §10 and workspace testing rules.

## 1. Automated tests

| Layer     | Scope                                               | Tool                     |
| --------- | --------------------------------------------------- | ------------------------ |
| Unit      | Pure helpers (e.g. `navVisibility`), schema parsers | Vitest                   |
| API route | BFF handlers with mocked server modules             | Vitest + `NextRequest`   |
| Component | Client shells with RTL where logic warrants         | Vitest + Testing Library |

**Minimum:** new role or navigation rules require updates to `navVisibility` tests; new BFF contracts require route tests.

## 2. Playwright E2E expectations

Critical journeys (to be automated incrementally):

- Locale switch preserves path (`next-intl` routing).
- Dev login → dashboard loads metrics card without unhandled errors.
- Schedule and chat surfaces load for an authenticated staff user.

## 3. Localization

- No hardcoded user-visible strings in `app/` or feature components; use `next-intl` and `common` (or domain) messages from `@myclup/i18n`.
- **English and Turkish** parity for new keys under `common.gymAdminWeb.*` (see `packages/i18n/src/__tests__/common-gym-admin-web-keys.test.ts`).

## 4. Tenant isolation and permissions

- All data mutations go through `/api/v1/*` BFF routes that validate **Supabase session**, **tenant scope**, and **role** server-side.
- UI role-aware nav (`GymAdminShell`) is **supplementary**; never rely on it for authorization.

## 5. Analytics

- Product analytics use `@myclup/analytics` taxonomy (`docs/18-analytics-observability-spec.md`).
- Dashboard and future admin actions should emit events via a shared emitter; noop is acceptable until GA4 wiring is configured per environment.

## 6. Accessibility baseline

- Focus order: sidebar → main content; visible focus styles on links.
- Primary headings (`h1`) per route for screen reader structure.
