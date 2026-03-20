# Mobile Admin (`apps/mobile-admin`) — QA and localization acceptance

This document satisfies **#172** (Epic #31). It complements `docs/07-technical-plan.md` §10 and `AGENT.md` testing/localization rules.

## 1. Automated test layers

| Layer            | Scope                                                         | Tool                                           |
| ---------------- | ------------------------------------------------------------- | ---------------------------------------------- |
| Unit             | Pure helpers (e.g. `navVisibility`, locale helpers)           | Vitest                                         |
| Component / hook | Chat hooks, schedule workspace hook, staff session hooks      | Vitest + React Test Renderer / RTL where wired |
| Integration      | API-backed flows against BFF contracts (run in CI with mocks) | Vitest                                         |

**Minimum for each new staff screen or tab:** unit or hook coverage when logic exists; no new business logic without a test target.

## 2. Localization acceptance

- All user-visible strings on staff surfaces MUST use `react-i18next` namespaces (`common`, `chat`, `membership`, `auth`, `errors` as applicable).
- **English and Turkish** keys MUST stay in parity for keys introduced or changed under `packages/i18n` for mobile-admin.
- Run / extend `packages/i18n/src/__tests__/common-staff-mobile-keys.test.ts` when adding `common.staff*` keys.
- Dates, numbers, and currencies MUST use shared locale utilities when displayed (not hardcoded formats).

## 3. Role-aware access control tests

- **Client:** `getTabVisibility` (and future guards) MUST have unit tests for representative roles (`platform_admin`, `gym_sales`, `branch_instructor`, empty role fallback).
- **Server:** Any member, attendance, or sales API used from mobile-admin MUST enforce tenant and role checks on the BFF; mobile UI MUST NOT be the only enforcement layer.

## 4. Platform expectations

- **iOS and Android:** smoke-test tab navigation, sign-in, chat list → thread, schedule workspace load, members → attendance validation on both platforms before release.
- **Accessibility:** primary actions reachable with large text; tab labels readable; error states announced where VoiceOver/TalkBack is supported.

## 5. Performance baseline

- Initial tab shell should not block longer than auth + `whoami` round-trip; show loading indicator until session is known.
- Chat and schedule lists should use pagination/cursors per shared contracts (no unbounded client fetch).

## 6. Release checklist (staff mobile)

- [ ] Lint, typecheck, and tests pass for `apps/mobile-admin`
- [ ] New copy has `en` / `tr` keys and parity test updated if applicable
- [ ] Role tab visibility verified for at least one gym role and one instructor role
- [ ] Sign-in and sign-out (if implemented) verified on iOS and Android
