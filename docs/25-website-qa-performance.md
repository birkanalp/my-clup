# Public website — QA and performance validation (#189)

## 1. Automated tests

- **Unit / component**: `LocaleSwitcher`, `LeadCaptureForm` behavior (analytics noop, validation).
- **i18n**: `common.publicSite.*` en/tr parity (`common-public-site-keys.test.ts`).

## 2. Manual / E2E (Playwright)

- Locale switch preserves path and updates `html lang`.
- Each localized route returns **200** and renders **unique `h1`** per page.
- Contact form submit shows success state without console errors.

## 3. Performance

- Lighthouse **performance ≥ 85** and **SEO ≥ 90** on home and contact on a cold load (target; tune assets before release).
- Images must use `next/image` when real assets ship; avoid blocking third-party scripts until GA4 is configured with consent.

## 4. Analytics

- Lead capture emits `mc_marketing_lead_submit` via `@myclup/analytics` (noop until GA4 wiring). Wire `gtag` per `docs/18-analytics-observability-spec.md` §1.
