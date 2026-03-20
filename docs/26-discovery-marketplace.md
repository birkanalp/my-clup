# Discovery marketplace — boundaries, experiences, and governance (#192, #194, #197, #199, #202)

## 1. Domain boundaries (#192)

- **Public discovery** surfaces (website + mobile) consume **read-optimized, tenant-scoped** listing data; they never bypass RLS or gym-admin authorization.
- **Writes** (reviews, trial requests, leads) go through **BFF routes** with Zod contracts, explicit **consent locale**, and **audit** where the action is sensitive.
- **Gym-managed content** is edited in **gym admin** (`/listing` stub in `web-gym-admin`); published snapshots feed discovery with version metadata.

## 2. Website and mobile experience (#194)

- **Website**: `/[locale]/discover` (see `apps/web-site`) with localized metadata via `buildPublicMetadata`.
- **Mobile**: `apps/mobile-user` discovery tab uses `memberDiscovery.*` keys; parity with product intent is tested via `common-member-booking-keys.test.ts`.

## 3. Content and moderation (#197)

- Listing fields (name, description, amenities, media) support **per-locale variants**; moderation actions on user-generated content are **audited** and **tenant-scoped** unless platform policy applies.

## 4. Reviews, trials, and lead routing (#199)

- **Reviews**: structured contract; no anonymous cross-tenant writes; rate limits and report flows TBD in implementation issues.
- **Trial requests**: create **lead** records with `locale` + `source=discovery`; route to gym **sales** workflows (see mobile-admin sales stub).
- **Analytics**: use `McGa4Event` taxonomy; marketing/discovery events documented in `docs/18-analytics-observability-spec.md`.

## 5. SEO and locale governance (#202)

- Discovery indexable URLs are **locale-prefixed**; canonical and `hreflang` follow the same helper as other public pages.
- Sitemap includes `/discover`; update `STATIC_PATHS` when adding listing detail routes.
- Listing detail pages must expose **structured data** (e.g. `LocalBusiness`) when real data ships—track in a future implementation issue.

## 6. Precedence

`docs/05-website-plan.md`, `docs/07-technical-plan.md`, and workspace **website SEO** rules override this document when they conflict.
