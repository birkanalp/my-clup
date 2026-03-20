# Public website — localization and content governance (#186)

## 1. Versioned legal content

- **Privacy** and **terms** must be replaced with **locale-specific, versioned** legal copy before production (`publicSite.legal.*` keys in `@myclup/i18n`).
- Record which locale and version a user accepted when storing consent (outside this repo’s marketing stubs).

## 2. Marketing copy

- All strings live under `common.publicSite.*` (or future dedicated namespaces) with **en/tr parity** enforced by `packages/i18n` tests.
- Campaign landing pages must reuse the same SEO helper pattern (`buildPublicMetadata`) for canonical and `hreflang` alternates.

## 3. SEO

- `NEXT_PUBLIC_SITE_URL` drives canonical URLs and sitemap entries in `src/app/sitemap.ts`.
- New top-level routes must be added to `STATIC_PATHS` in the sitemap and receive their own `generateMetadata`.

## 4. Precedence

`docs/05-website-plan.md` and `docs/07-technical-plan.md` override this note when they conflict.
