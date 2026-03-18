# MyClup Technical Plan

## 1. Goals and Architecture Principles

MyClup will be built as a TypeScript monorepo that powers five product surfaces:

- Expo member app
- Expo gym/instructor app
- Next.js gym admin panel
- Next.js platform admin panel
- Next.js marketing and SEO website

The platform architecture is fixed around these principles:

- Shared contracts first
- Tenant-safe by default
- Chat is a core platform subsystem
- Mobile and web consume the same backend contracts
- Business logic must not live in UI-only layers
- AI is server-side only
- Reuse packages before duplicating code
- Multilingual client experience is mandatory across all product surfaces

These principles are mandatory defaults for all future implementation work.

## 2. Monorepo Structure

### 2.1 Repository Stack Defaults

- Package manager: `pnpm`
- Monorepo orchestrator: `turborepo`
- Language: `TypeScript`

### 2.2 Top-Level Monorepo Layout

The monorepo will use this exact top-level structure:

```text
apps/
  mobile-user/
  mobile-admin/
  web-gym-admin/
  web-platform-admin/
  web-site/

packages/
  api-client/
  contracts/
  types/
  utils/
  ui-web/
  ui-native/
  config-typescript/
  config-eslint/
  config-prettier/
  config-tailwind/
  supabase/
```

### 2.3 App Responsibilities

- `apps/mobile-user`
  Member-facing Expo app for memberships, bookings, chat, progress, and discovery.
- `apps/mobile-admin`
  Gym/instructor Expo app for member operations, classes, chat, check-in, and workouts.
- `apps/web-gym-admin`
  Main gym operating panel in Next.js.
- `apps/web-platform-admin`
  Internal MyClup admin panel in Next.js.
- `apps/web-site`
  Public SEO-first marketing and discovery website in Next.js.

### 2.4 Shared Package Responsibilities

- `packages/contracts`
  Owns shared API schemas, input/output validation, and cross-app request/response contracts.
- `packages/types`
  Owns shared domain types that are framework-agnostic.
- `packages/api-client`
  Owns typed API access consumed by web and mobile apps.
- `packages/utils`
  Owns framework-agnostic helpers, formatters, pure functions, and reusable non-UI logic.
- `packages/ui-web`
  Owns shared reusable web UI components and web-specific presentation primitives.
- `packages/ui-native`
  Owns shared reusable native UI components and Expo-specific presentation primitives.
- `packages/config-typescript`
  Owns shared TypeScript base configs.
- `packages/config-eslint`
  Owns shared lint rules.
- `packages/config-prettier`
  Owns shared formatting defaults.
- `packages/config-tailwind`
  Owns shared design tokens and Tailwind / NativeWind theme configuration.
- `packages/supabase`
  Owns database type generation outputs, shared clients, SQL conventions, RLS guidance, and server helper utilities.

### 2.6 Localization Foundation

The monorepo must be designed for multilingual client delivery from day one.

Core localization rules:

- All client-facing text must come from translation resources or localized content models
- Locale selection must be available across web and mobile clients
- Shared translation keys and locale helpers should live in shared packages rather than per-app duplication
- Locale formatting helpers for dates, times, numbers, currencies, and units should be shared
- Missing translation behavior must fall back safely to a defined default locale

### 2.5 Package Boundary Rules

- `contracts` is the source of truth for shared API schemas and validation.
- `types` is the source of truth for shared domain models.
- `api-client` is the only shared network client layer.
- `utils` must remain framework-agnostic.
- `ui-web` and `ui-native` own presentation primitives, not backend orchestration.
- App-specific business flows remain inside the app unless reused by at least two apps.
- No app may redefine a shared contract locally.
- No app may copy shared types into local feature folders.
- Shared packages should be introduced only when reuse is real and immediate.

## 3. Frontend Stack

### 3.1 Web

- Framework: Next.js
- Styling: Tailwind CSS
- Primary use cases: admin panels, website, platform operations, SEO pages

### 3.2 Mobile

- Framework: Expo
- Styling: NativeWind
- Primary use cases: member mobile app and gym/instructor mobile app

### 3.3 Design System Defaults

- Shared design tokens will be defined once and consumed by both Tailwind and NativeWind.
- Design tokens must include at minimum:
  - Color
  - Spacing
  - Radius
  - Typography
  - Shadow
  - Motion timing
  - Layering / z-index
- Web and native UI packages will share design language, not forced implementation parity.
- Feature components stay app-local until reuse is proven.
- Marketing website components remain separate from admin components.
- Forms should validate against shared schemas from `packages/contracts`.

### 3.4 Frontend Architecture Rules

- Presentation components should stay lightweight and composable.
- Business orchestration must live outside page or screen components.
- Data fetching logic should be centralized per app domain.
- Shared UI should not import app-local business modules.
- Admin UIs and marketing UIs should not share visual primitives unless there is clear reusable value.
- All client apps must support runtime language selection or locale detection.
- Text rendering must be translation-driven, not hardcoded in feature screens.
- Dates, times, numbers, currencies, and measurement units must be locale-aware.
- Right-to-left readiness should be considered in layout and component design even if v1 launches in LTR languages.

## 4. Backend and API Architecture

### 4.1 Backend Shape

The default backend shape is:

- Next.js BFF / API layer
- Supabase for managed backend capabilities

Expo apps will call the Next.js API layer over HTTPS.

### 4.2 Supabase Responsibilities

Supabase is the source of truth for:

- Authentication
- Postgres database
- File storage
- Realtime delivery

### 4.3 Server Responsibilities

The Next.js backend layer will own:

- Authentication and session handling
- Tenant and permission enforcement
- Domain orchestration for memberships, classes, chat, campaigns, and AI
- Secure server-side integration with Supabase and Ollama
- Webhook handling for auth, payment, and provider callbacks when needed

### 4.4 API Rules

- API versioning uses `/api/v1`
- Request and response schemas are validated with Zod
- Shared typed API client is consumed by all apps
- Business logic is implemented in server modules, not page files
- API authorization must never depend on client-side assumptions
- All write paths must verify role and tenant scope on the server
- Locale and language preference must be part of relevant user and content contracts
- APIs serving public content, campaigns, notifications, or legal text must support locale selection

### 4.5 Long-Term Flexibility

- No separate NestJS service exists in v1
- If a dedicated backend service is needed later, the `contracts` and `api-client` boundaries must allow migration without changing clients wholesale
- Future service extraction must preserve contract compatibility first

## 5. Data and Multi-Tenant Model

### 5.1 Database Model

- Single Supabase Postgres database
- Multi-tenant model:
  - `gym` is the root tenant
  - `branch` is the operational scope
- Row Level Security is required for tenant-owned data
- Platform admin access must go through audited elevated flows only

### 5.2 Mandatory Domain Groups

The data model must cover these domain groups:

- Auth identities and user profiles
- Gyms and branches
- Role assignments
- Members and prospects
- Membership plans and active memberships
- Payments and invoices
- Classes, appointments, bookings, attendance
- Conversations, participants, messages, receipts, attachments
- Workouts, exercises, progress logs
- Campaigns, notifications, ad audiences
- Audit logs

### 5.3 Modeling Defaults

- One auth user can hold multiple roles across multiple gyms and branches
- Roles are modeled through assignment tables, not hard-coded user types
- Branch scoping must be expressible independently of gym ownership
- Member, instructor, staff, and admin relationships must be modeled explicitly
- Every write path must verify tenant scope server-side
- Cross-tenant access must be denied by default
- User locale preference must be modeled, with optional locale defaults for gyms and branches
- Localized content should use translation tables or localized field groups instead of duplicating entire business records

### 5.4 Permission Model Defaults

The permission model must support:

- Platform-level roles
- Gym-level roles
- Branch-level roles
- Feature-level permissions
- Action-level approvals for sensitive flows

Sensitive flows include:

- Role changes
- Billing overrides
- Membership manual extension
- Refunds
- Admin impersonation
- Cross-tenant support access

## 6. Auth and Login Strategy

### 6.1 Identity Provider

- Auth provider: Supabase Auth

### 6.2 First-Class Login Methods

The architecture must directly support:

- Email/password
- Email magic link
- Phone OTP
- Google
- Apple
- Facebook
- X/Twitter

### 6.3 Future-Ready Methods

The architecture must be designed to support later without core refactor:

- Passkeys / WebAuthn
- Guest-to-account upgrade
- Enterprise SSO
- Provider linking
- Session and device management

### 6.4 Auth Architecture Rules

- Canonical identity is Supabase `user.id`
- Profile and role records are internal platform records layered on top of auth users
- OAuth provider metadata normalization is centralized
- Mobile and web share the same auth and session concepts
- Auth provider additions must go through the shared auth layer, not app-local code
- Identity linking must preserve a single internal profile model per human user where applicable
- User language preference should be captured during onboarding and editable later

## 7. Chat and Realtime Architecture

Chat is the flagship subsystem and must be treated as a platform capability, not a secondary feature.

### 7.1 Core Chat Decisions

- Durable messages are stored in Postgres
- Live updates are delivered via Supabase Realtime
- Presence and typing state are ephemeral
- Media and attachments are stored in Supabase Storage
- Read state is tracked per participant
- Conversation history uses cursor-based pagination
- Clients use optimistic UI sending
- Message creation must be idempotent

### 7.2 Supported Conversation Types

- Direct
- Member-to-gym support
- Member-to-instructor
- Group
- Broadcast
- Internal staff

### 7.3 Required Chat Contracts and Types

The shared model must include:

- `Conversation`
- `ConversationParticipant`
- `Message`
- `MessageAttachment`
- `MessageReceipt`
- `ConversationAssignment`
- `TypingState`

### 7.4 Chat Safety and Operational Rules

- Tenant isolation is enforced on every conversation query
- Broadcast is a separate workflow from free-form group messaging
- Search must be server-side
- Assignment, labels, templates, and quick replies are separate from raw message records
- Conversation membership must be validated before message access
- Staff-assigned chats must preserve auditability for reassignment
- Message templates, automated replies, and chatbot content must support locale-aware variants

## 8. AI Architecture

### 8.1 Runtime and Hosting

- AI runtime: Ollama
- Model family: Qwen small instruct model
- Exact model version is chosen by environment config at implementation time
- AI requests are server-side only
- Ollama runs via Docker locally and can be self-hosted where appropriate

### 8.2 Initial AI Use Cases

- Workout text cleanup
- Exercise extraction from rough trainer input
- Chat summarization
- Suggested staff replies
- Campaign copy drafting

### 8.3 AI Safety and Implementation Rules

- Prompt templates are versioned in code
- Outputs must be validated against Zod schemas
- Timeouts are required
- Retry policies are required
- A feature flag must exist to disable AI safely
- Sensitive raw prompts should not be stored long-term without a strong reason
- No client app may call Ollama directly
- AI prompt and output handling must support explicit input and output locale control

### 8.4 AI Service Boundary

AI functionality should be exposed to applications through a shared server-side service boundary that standardizes:

- Prompt building
- Model selection
- Output validation
- Logging and tracing
- Error handling
- Safety fallback behavior

## 9. Analytics, Logging, and Monitoring

### 9.1 Analytics

- Google Analytics 4 is required for the website and web products
- A shared event naming convention must be defined
- Mobile analytics abstraction should exist from day one so events can remain consistent across platforms
- Analytics should capture locale where useful for product, growth, and SEO analysis

### 9.2 Logging and Auditability

Audit logging is mandatory for sensitive operations.

Mandatory audit events include:

- Role changes
- Membership changes
- Payment status changes
- Admin impersonation
- Tenant-scope overrides
- Important chat moderation actions

### 9.3 Monitoring Defaults

- Error monitoring abstraction must be prepared for later provider integration
- Critical backend failures should be traceable
- Auth failures, permission denials, and AI fallback events should be observable
- Chat delivery and realtime subscription failures should be traceable

## 10. Testing Strategy

### 10.1 Required Test Layers

- Unit tests for shared utilities, schemas, and parsing
- Integration tests for auth, tenant permissions, memberships, bookings, and chat flows
- Playwright for web end-to-end tests
- React Native Testing Library for mobile component and flow tests
- RLS verification tests for cross-tenant denial

### 10.2 Mandatory Scenarios

The baseline automated test strategy must cover:

- Login flows
- Member lifecycle
- Class booking and cancellation
- Chat send, read, and reconnect
- AI workout formatting returning a valid schema
- Multi-role user across gyms and branches
- Admin-only elevated operations remaining audited

### 10.3 Quality Bar

- Shared packages should not ship without unit coverage where logic exists
- Permission-sensitive logic requires explicit tests
- Contract changes require downstream validation
- Chat changes require realtime and read-state verification

## 11. CI/CD and Developer Experience

### 11.1 Pipeline Defaults

- Turborepo task graph for `lint`, `typecheck`, `test`, and `build`
- Docker used for local development support services and CI parity
- Vercel for Next.js deployments
- Supabase as the managed backend

### 11.2 Environment Strategy

Environment variables must be separated into:

- App public envs
- Shared runtime envs
- Secret server-only envs

Secrets must never be assumed to be safe in client apps.

Localization configuration must also define:

- Default locale
- Supported locales
- Fallback locale
- Locale-specific public URL strategy for the website

### 11.3 CI Expectations

- Every app and package must typecheck
- Shared contracts cannot change without downstream validation
- E2E runs for web apps on protected branches or release pipelines
- Migrations and RLS tests must run before production promotion once database work starts

### 11.4 Developer Experience Goals

- Fast local setup
- Reproducible environments
- Strong type safety across app boundaries
- Shared configs to reduce divergence
- Clear package ownership to reduce duplication

## 12. Non-Goals for v1

The following are explicitly out of scope for v1 architecture:

- No dedicated NestJS backend
- No microservices split
- No third-party chat SaaS
- No client-side direct AI calls
- No duplicate local type systems per app

## 12.1 Multilingual Delivery Requirements

Multilingual support is a v1 architecture requirement, not a future enhancement.

This means:

- The website must be SEO-safe across locales
- Mobile and web apps must not hardcode a single language
- Shared packages must be locale-aware where they touch user-facing content
- Gym-managed public content, campaigns, legal content, and automated communication should be modeled with localization in mind

## 13. Implementation Readiness Checklist

Before application scaffolding starts, this plan should be treated as the source of truth for:

- Repo layout
- Shared package boundaries
- Backend shape
- Auth strategy
- Tenant model
- Chat model
- AI integration boundary
- Testing expectations
- CI/CD defaults
