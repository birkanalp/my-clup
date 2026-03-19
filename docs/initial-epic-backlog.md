# Initial Epic Backlog

## 1. Summary

This file records the canonical initial Epic backlog created in GitHub for MyClup based on the repository planning and workflow documents.

- Canonical Epic issues: `#13`, `#14`, `#15`, `#16`, `#17`, `#18`, `#19`, `#29`, `#30`, `#31`, `#32`, `#33`, `#34`, `#35`, `#36`, `#37`
- Canonical owner for all current epics: `owner:orchestrator`
- Canonical lifecycle for all current epics: `state:proposed`
- GitHub Project: `MyClup Development`

Legacy note:

- Existing issues `#1` through `#12` predate the Epic-first orchestration pass and remain a legacy task-level backlog.
- Duplicate Epic issues `#20` through `#28` were created during a failed creation pass and were closed in favor of the canonical issues `#29` through `#37`.

## 2. Epic List

- `#13` `[Epic] Monorepo, Tooling, and Delivery Foundations`
  Purpose: establish the repo-wide monorepo, tooling, workspace, and delivery baseline.
  Priority: `p0`
  Owner: `owner:orchestrator`
  Surfaces: `surface:shared`
  Dependency summary: no blockers; first foundational epic.

- `#14` `[Epic] Shared Backend Platform, Contracts, and API Layer`
  Purpose: define shared contracts, shared packages, Supabase boundaries, and the `/api/v1` BFF shape.
  Priority: `p0`
  Owner: `owner:orchestrator`
  Surfaces: `surface:shared`
  Dependency summary: depends on `#13`.

- `#15` `[Epic] Authentication, Identity, Tenant Model, and Permissions`
  Purpose: define auth, profile, tenant, role, branch, and permission foundations.
  Priority: `p0`
  Owner: `owner:orchestrator`
  Surfaces: `surface:shared`, `surface:mobile-user`, `surface:mobile-admin`, `surface:web-gym-admin`, `surface:web-platform-admin`
  Dependency summary: depends on `#13` and `#14`.

- `#16` `[Epic] Localization and Multilingual Content Foundations`
  Purpose: define shared translation, locale, formatting, and multilingual content rules across every client surface.
  Priority: `p0`
  Owner: `owner:orchestrator`
  Surfaces: `surface:shared`, `surface:mobile-user`, `surface:mobile-admin`, `surface:web-gym-admin`, `surface:web-platform-admin`, `surface:web-site`
  Dependency summary: depends on `#13` and `#14`.

- `#17` `[Epic] Chat, Notifications, and Communication Platform`
  Purpose: define the flagship chat and communication subsystem across member, staff, admin, and lead workflows.
  Priority: `p0`
  Owner: `owner:orchestrator`
  Surfaces: `surface:shared`, `surface:mobile-user`, `surface:mobile-admin`, `surface:web-gym-admin`, `surface:web-platform-admin`, `surface:web-site`
  Dependency summary: depends on `#14`, `#15`, and `#16`.

- `#18` `[Epic] Memberships, Billing, and Member Lifecycle Management`
  Purpose: define membership plans, lifecycle actions, billing, invoices, reminders, and finance visibility.
  Priority: `p1`
  Owner: `owner:orchestrator`
  Surfaces: `surface:shared`, `surface:mobile-user`, `surface:mobile-admin`, `surface:web-gym-admin`, `surface:web-platform-admin`
  Dependency summary: depends on `#14`, `#15`, and `#16`.

- `#19` `[Epic] Scheduling, Bookings, Appointments, and Attendance`
  Purpose: define classes, appointments, bookings, waitlists, attendance, and calendar operations.
  Priority: `p1`
  Owner: `owner:orchestrator`
  Surfaces: `surface:shared`, `surface:mobile-user`, `surface:mobile-admin`, `surface:web-gym-admin`
  Dependency summary: depends on `#14`, `#15`, and `#16`.

- `#29` `[Epic] Analytics, Auditability, and Observability Foundations`
  Purpose: define shared analytics, audit logging, operational logging, and observability standards.
  Priority: `p1`
  Owner: `owner:orchestrator`
  Surfaces: `surface:shared`, `surface:mobile-user`, `surface:mobile-admin`, `surface:web-gym-admin`, `surface:web-platform-admin`, `surface:web-site`
  Dependency summary: depends on `#13`, `#14`, and `#15`.

- `#30` `[Epic] Member Mobile App MVP`
  Purpose: deliver the member-facing Expo MVP against the shared platform epics.
  Priority: `p1`
  Owner: `owner:orchestrator`
  Surfaces: `surface:mobile-user`
  Dependency summary: depends on `#15`, `#16`, `#17`, `#18`, `#19`, and `#29`.

- `#31` `[Epic] Staff Mobile App MVP`
  Purpose: deliver the staff-facing Expo MVP for member operations, attendance, chat, and workout flows.
  Priority: `p1`
  Owner: `owner:orchestrator`
  Surfaces: `surface:mobile-admin`
  Dependency summary: depends on `#15`, `#16`, `#17`, `#18`, `#19`, and `#29`.

- `#32` `[Epic] Gym Admin Web MVP`
  Purpose: deliver the main gym operations web surface for members, billing, scheduling, inbox, and reporting.
  Priority: `p1`
  Owner: `owner:orchestrator`
  Surfaces: `surface:web-gym-admin`
  Dependency summary: depends on `#15`, `#16`, `#17`, `#18`, `#19`, and `#29`.

- `#33` `[Epic] Platform Admin Web MVP`
  Purpose: deliver the internal platform admin surface for oversight, moderation, support, and governance.
  Priority: `p1`
  Owner: `owner:orchestrator`
  Surfaces: `surface:web-platform-admin`
  Dependency summary: depends on `#15`, `#16`, and `#29`.

- `#34` `[Epic] Public Website and Marketing Platform`
  Purpose: deliver the multilingual, SEO-first public marketing and conversion website.
  Priority: `p1`
  Owner: `owner:orchestrator`
  Surfaces: `surface:web-site`
  Dependency summary: depends on `#13`, `#14`, `#16`, and `#29`.

- `#35` `[Epic] Discovery Marketplace and Public Listings`
  Purpose: deliver cross-surface discovery, public listings, moderation, and lead-generation flows.
  Priority: `p1`
  Owner: `owner:orchestrator`
  Surfaces: `surface:shared`, `surface:mobile-user`, `surface:web-gym-admin`, `surface:web-platform-admin`, `surface:web-site`
  Dependency summary: depends on `#16`, `#18`, `#19`, `#32`, `#33`, and `#34`.

- `#36` `[Epic] AI Service Foundation and AI-Assisted Workflows`
  Purpose: define the shared server-side AI boundary and the documented AI-assisted use cases.
  Priority: `p2`
  Owner: `owner:orchestrator`
  Surfaces: `surface:shared`, `surface:mobile-user`, `surface:mobile-admin`, `surface:web-gym-admin`
  Dependency summary: depends on `#14`, `#15`, `#16`, `#17`, `#18`, and `#19`.

- `#37` `[Epic] Add-on Package Platform and Commercial Module Enablement`
  Purpose: define shared entitlement and governance foundations for optional add-on modules.
  Priority: `p2`
  Owner: `owner:orchestrator`
  Surfaces: `surface:shared`, `surface:mobile-admin`, `surface:web-gym-admin`, `surface:web-platform-admin`
  Dependency summary: depends on `#15`, `#16`, `#17`, `#29`, `#32`, `#33`, and `#36`.

## 3. Epic Priority Order

1. `#13` Monorepo, Tooling, and Delivery Foundations
2. `#14` Shared Backend Platform, Contracts, and API Layer
3. `#15` Authentication, Identity, Tenant Model, and Permissions
4. `#16` Localization and Multilingual Content Foundations
5. `#17` Chat, Notifications, and Communication Platform
6. `#18` Memberships, Billing, and Member Lifecycle Management
7. `#19` Scheduling, Bookings, Appointments, and Attendance
8. `#29` Analytics, Auditability, and Observability Foundations
9. `#30` Member Mobile App MVP
10. `#31` Staff Mobile App MVP
11. `#32` Gym Admin Web MVP
12. `#33` Platform Admin Web MVP
13. `#34` Public Website and Marketing Platform
14. `#35` Discovery Marketplace and Public Listings
15. `#36` AI Service Foundation and AI-Assisted Workflows
16. `#37` Add-on Package Platform and Commercial Module Enablement

## 4. Dependency Notes

- Foundation chain:
  `#13` enables `#14`; `#14` enables `#15`, `#16`, and the shared backend assumptions for later epics.
- Core platform blockers:
  `#15` and `#16` block every protected or client-facing surface.
- Flagship subsystem blocker:
  `#17` must land before chat-heavy member, staff, and gym-admin work is broken into implementation tasks.
- Domain blockers:
  `#18` and `#19` are the shared operational backbones for the mobile apps and the gym-admin web app.
- Cross-cutting quality blocker:
  `#29` should shape downstream tasks before implementation begins for major surfaces.
- Surface layer:
  `#30`, `#31`, `#32`, `#33`, and `#34` should be decomposed after the shared blockers above are accepted.
- Marketplace layer:
  `#35` sits after website plus listing-management-ready admin surfaces and the membership or scheduling foundations it relies on.
- Later-stage expansion:
  `#36` depends on the shared backend, localization, communication, and operational domains.
  `#37` depends on the governance, analytics, AI, and admin foundations rather than preceding them.

## 5. Recommended Next Step

The next agent to run should be the `business-analyst-agent`, whose job will be to take each epic and break it into implementation-ready task issues.
