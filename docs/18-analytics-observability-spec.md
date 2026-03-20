# Analytics, Audit, Logging, and Observability — Authoritative Spec

This document satisfies **Epic #29** tasks **#163–#167**. It extends and operationalizes `docs/07-technical-plan.md` §9 and `.cursor/rules/auditability-analytics-and-observability.mdc`. On conflict, **`docs/07-technical-plan.md` wins**; this spec adds implementation detail and shared-package contracts.

**Related code**

- Product analytics taxonomy and emitters: `packages/analytics`
- Durable audit writes: `packages/supabase` (`writeAuditEvent`, `audit_events`, payload schemas)

---

## 1. Shared analytics event naming (#163)

### 1.1 Naming convention (wire format)

- **GA4 event names** MUST be **snake_case**, use only **`[a-z0-9_]`**, and stay within **40 characters** (GA4 limit).
- **Prefix**: `mc_` (MyClup) to avoid collisions with third-party and recommended events.
- **Shape**: `mc_{domain}_{object}_{action}`  
  Examples: `mc_booking_session_view`, `mc_auth_login_success`.

**Logical names** (for code and docs) use dot notation: `booking.session.view`. The shared package maps logical → wire via `logicalEventToGa4Name` (see `packages/analytics`).

### 1.2 Taxonomy domains

| Domain       | Purpose                                     |
| ------------ | ------------------------------------------- |
| `auth`       | Login, logout, session refresh, MFA         |
| `booking`    | Schedule, book, cancel, waitlist            |
| `chat`       | Thread open, send, attach (no message body) |
| `membership` | Plan view, purchase intent, renewal         |
| `discovery`  | Search, filter, gym profile view            |
| `progress`   | Workout log, goals                          |
| `admin`      | Staff actions in admin surfaces (non-audit) |
| `website`    | Marketing site engagement                   |

Wire name **`mc_marketing_lead_submit`** is registered in `@myclup/analytics` for public lead forms.

### 1.3 Required metadata (all product analytics events)

Every emitted event MUST include a consistent **context** object (see `AnalyticsContext` in `packages/analytics`):

| Field            | Required | Notes                                                                                    |
| ---------------- | -------- | ---------------------------------------------------------------------------------------- |
| `schema_version` | Yes      | Bump when breaking context shape changes                                                 |
| `surface`        | Yes      | `web_gym_admin` \| `web_platform_admin` \| `web_site` \| `mobile_user` \| `mobile_admin` |
| `locale`         | Yes      | BCP-47 tag (e.g. `en`, `tr`); use `und` if unknown                                       |
| `gym_id`         | If known | UUID; omit if not in tenant context                                                      |
| `branch_id`      | If known | UUID; omit if not applicable                                                             |
| `session_id`     | If known | Anonymous session id from app runtime                                                    |

**Never** send raw PII (email, phone, full name) in analytics params. Prefer opaque ids or hashed identifiers where allowed by policy.

### 1.4 GA4 integration pattern (web)

- Load GA4 via **gtag.js** or **Google Tag Manager** from Next.js apps (`web-site`, `web-gym-admin`, `web-platform-admin`).
- Use **environment-specific** measurement IDs; do not commit secrets.
- Call `gtag('event', wireEventName, params)` where `params` flatten context keys with a `mc_` prefix where needed to avoid GA4 reserved key collisions, e.g. `mc_locale`, `mc_surface`.
- **Server-side**: optional Measurement Protocol for critical conversions only; must not replace client consent rules.

### 1.5 Mobile analytics pattern (Expo)

- Apps MUST depend on `@myclup/analytics` and call a single **`AnalyticsEmitter`** implementation per build.
- **Development**: default to `createConsoleAnalyticsEmitter` or no-op.
- **Production**: implement `AnalyticsEmitter` that forwards to **Firebase Analytics** (recommended for GA4-linked apps) or another approved provider; **event names and param keys MUST match** the web taxonomy (same `mc_*` wire names).
- Screen views: map Expo Router routes to `mc_screen_view` with `screen_name`, `screen_class`, plus `AnalyticsContext`.

### 1.6 Shared abstraction

- **`@myclup/analytics`**: canonical wire event constants, context type, GA4 name validation, and `AnalyticsEmitter` factories.
- Apps MUST NOT invent ad-hoc event strings; add new events to the package + this doc in the same PR.

---

## 2. Audit log requirements for sensitive actions (#164)

### 2.1 Categories requiring audit logging

Mandatory (non-exhaustive; align with `writeAuditEvent` and `AuditEventType`):

- Role and staff assignment changes
- Membership create / renew / freeze / cancel / manual extension
- Payment and billing status changes and **billing overrides**
- Platform admin **impersonation** start/end
- **Cross-tenant** or tenant-scope overrides (support tools)
- Material **chat moderation** (delete message, ban user, etc.)

### 2.2 Schema expectations

- Durable rows live in **`audit_events`** (Postgres), written **server-side** via **`writeAuditEvent`** with a typed **`event_type`** and validated **payload** (`packages/supabase/src/audit/schemas.ts`).
- Each row MUST include: **`event_type`**, **`actor_id`** (nullable only for true system jobs), **`target_type`**, **`target_id`** (nullable when N/A), **`tenant_context`** (gym/branch scope), **`payload`**.

### 2.3 Before / after state

- When the operation mutates user-visible or compliance-relevant state, the payload SHOULD include **`before_state`** and **`after_state`** as **opaque snapshots** (JSON string or structured fields per schema), sufficient to reconstruct _what changed_ without storing secrets (tokens, full card numbers).

### 2.4 Retention and access

- **Retention**: follow legal/product policy; default expectation is **≥ 1 year** for billing and access-control events unless law requires longer.
- **Read access**: **platform admin** and **auditor** roles only for cross-tenant views; **gym admin** scoped to their tenant. No client-direct reads of `audit_events`; use BFF/API with RLS and role checks.

---

## 3. Structured logging and error visibility (#165)

### 3.1 Log format

Server logs SHOULD be **JSON lines** with required fields (see `StructuredLogEntry` in `packages/analytics`):

| Field      | Description                                       |
| ---------- | ------------------------------------------------- |
| `ts`       | ISO-8601 timestamp                                |
| `level`    | `debug` \| `info` \| `warn` \| `error` \| `fatal` |
| `service`  | e.g. `bff`, `ai`, `worker`                        |
| `trace_id` | Request/correlation id when available             |
| `msg`      | Human-readable summary                            |
| `attrs`    | Arbitrary structured attributes (no PII)          |

### 3.2 Severity

- **error**: failed user request or invariant violation; needs triage.
- **fatal**: process unsafe; immediate page/alert.
- **warn**: degraded or retriable failure.
- **info**: successful boundary crossings (e.g. auth success).
- **debug**: development-only detail; disabled in production by default.

### 3.3 Subsystem obligations

| Subsystem            | Log at minimum                                                             |
| -------------------- | -------------------------------------------------------------------------- |
| Auth                 | Failed login, refresh failure, session invalidation (reason codes)         |
| Chat                 | Message insert failure, Realtime subscribe failure, receipt update failure |
| Scheduling / booking | Booking conflict, idempotent replay, cancellation edge cases               |
| Billing              | Webhook validation failure, state transition errors                        |
| Tenant/RLS           | Permission denial, suspected cross-tenant access attempt                   |

### 3.4 Error monitoring abstraction

- Use **`ErrorMonitor`** interface (`packages/analytics`): `captureException`, `captureMessage`, optional user/context.
- BFF and workers accept a **no-op** implementation in tests; production wires **Sentry** or equivalent behind env config.

---

## 4. Observability for auth, chat, AI, and tenant-sensitive flows (#166)

### 4.1 Auth

- Trace **login**, **token refresh**, **logout**, and **session restore** with `trace_id` propagated from the edge/BFF.
- Log **failure reason** using stable codes (`auth_invalid_credentials`, `auth_rate_limited`, …) not raw provider errors.

### 4.2 Chat

- Trace **message create** (idempotency key), **Realtime delivery** subscription lifecycle, **read receipt** updates.
- On failure: log `conversation_id` (UUID), **not** message body.

### 4.3 AI

- Log **latency**, **model id**, **retry count**, **fallback used**, **schema validation failure** (Zod path), **feature flag** state.
- Do **not** log raw prompts containing PII; truncate or hash when debugging is required.

### 4.4 Tenant-sensitive writes

- Before write: log **permission check outcome** (allow/deny) with `gym_id` / `branch_id` / `actor_id`.
- On RLS/permission denial: **warn** with stable `denial_reason`.

### 4.5 Escalation

- **SLO-oriented** alerts for: auth error rate spike, chat delivery failure rate, AI fallback rate, tenant denial anomalies.

---

## 5. Admin reporting and monitoring integration (#167)

### 5.1 Gym admin (`web-gym-admin`)

- **Product analytics**: GA4 with `surface: web_gym_admin`; key funnels (bookings, membership, chat) use taxonomy from §1.
- **Operational metrics**: surface **API error rates** and **critical job failures** in a future ops dashboard; until then, rely on structured logs + monitor provider.

### 5.2 Platform admin (`web-platform-admin`)

- **Audit viewer**: read-only API over `audit_events` with **platform role** + filter by tenant/date/event_type.
- **Impersonation**: every impersonation session MUST emit audit events (start/end) and MUST NOT disable logging.

### 5.3 Release readiness (workflow)

- PR/issue closure MUST record: **tests run**, **localization note**, **analytics/audit decision** (per change checklist in workspace rules).
- No release with **new user-visible flows** without an explicit decision on **analytics events** and **audit** where applicable.

---

## 6. Change control

- **New GA4 events**: add to `packages/analytics` + update §1 tables in this doc.
- **New audit types**: extend `AuditEventType` and Zod payload schemas in `packages/supabase` + update §2.
- **Breaking context shape**: bump `ANALYTICS_SCHEMA_VERSION` in `packages/analytics`.
