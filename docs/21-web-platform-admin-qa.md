# Web Platform Admin (`apps/web-platform-admin`) — QA and release sensitivity

This document satisfies **#184** (Epic #33). Elevated-action rules are in **`docs/23-platform-audit-elevated-actions.md`** (#183).

## 1. Test expectations

| Layer       | Requirement                                                                                         |
| ----------- | --------------------------------------------------------------------------------------------------- |
| Unit        | Locale message loading, any future pure permission helpers                                          |
| Integration | Once BFF routes are mounted (or proxied), every `/api/v1/*` handler must have contract + auth tests |
| E2E         | Playwright for impersonation start/end, audit viewer access denial for non-platform roles           |

## 2. Localization

- All UI strings use `next-intl` with keys under `common.platformAdminWeb.*`.
- **English and Turkish** parity is enforced by `packages/i18n/src/__tests__/common-platform-admin-web-keys.test.ts`.

## 3. Release sensitivity

- Platform admin changes are **release-sensitive**: human approval must record who approved and when before production rollout.
- Cross-tenant features require **audit logging** per `docs/18-analytics-observability-spec.md` §2 and `packages/supabase` audit writers.

## 4. BFF wiring

- This app ships with a **UI shell** first. Point `NEXT_PUBLIC_BFF_BASE_URL` at the shared BFF (e.g. gym admin Next origin in local dev) when calling `whoami` and domain APIs from the browser; long-term, platform-specific routes should live behind a single gateway with identical contract validation.
