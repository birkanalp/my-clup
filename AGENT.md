# MyClup Engineering Guide

## 1. Repo Mission

This repository is a TypeScript monorepo for MyClup’s mobile apps, web apps, internal admin surfaces, and public website. Shared packages are the foundation, and implementation should optimize for reuse, tenant safety, long-term maintainability, and multilingual delivery.

## 2. Stack Defaults

The following are non-optional defaults unless the architecture docs are updated:

- `pnpm`
- `turborepo`
- `TypeScript`
- Next.js
- Expo
- Tailwind CSS
- NativeWind
- Supabase
- Playwright
- Docker
- Ollama with a small Qwen instruct model
- Google Analytics 4

## 3. Monorepo Boundaries

- Shared contracts live in `packages/contracts`
- Shared domain types live in `packages/types`
- Shared product analytics taxonomy and emitters live in `packages/analytics` (see `docs/18-analytics-observability-spec.md`)
- Server-side AI boundary (Ollama, Zod-validated outputs) lives in `packages/ai` (see `docs/27-ai-server-boundary.md`)
- Shared clients live in `packages/api-client`
- Shared web UI lives in `packages/ui-web`
- Shared native UI lives in `packages/ui-native`
- App-local code stays local until reuse is proven
- Do not copy or redefine contracts, types, or clients inside apps
- Do not create a shared package unless there is clear reuse value
- Do not hardcode client-facing strings in feature code when they belong in translation resources or localized content models

## 4. Backend and Data Rules

- Next.js API/BFF is the default backend surface
- Supabase is the source of truth for auth, database, storage, and realtime
- All tenant checks must happen server-side
- Row Level Security is mandatory for tenant-owned data
- Elevated admin access must be auditable
- Do not put business logic inside page or screen components
- Do not trust UI state for authorization
- Locale handling must be explicit in contracts that return user-facing content

## 5. Auth Rules

- Canonical identity is Supabase `user.id`
- Supported methods include email/password, magic link, phone OTP, Google, Apple, Facebook, and X/Twitter
- New auth providers must integrate through the shared auth layer
- Do not implement app-specific auth logic unless documented and approved
- Internal user profile and role assignment models must stay separate from raw auth provider data
- User language preference should be treated as part of the core profile model

## 6. Chat Rules

- Chat is a core subsystem, not a feature afterthought
- Persist messages in Postgres
- Use Supabase Realtime for live delivery
- Presence and typing remain ephemeral
- Supabase Storage is used for attachments
- Read receipts are required
- Tenant safety is required on all chat access
- Do not bypass shared chat contracts
- Templates and automated replies should support locale-aware variants

## 7. AI Rules

- AI calls are server-only
- Ollama access must be behind a shared service boundary
- All outputs must be schema-validated
- Prompt templates must be versioned
- Avoid storing sensitive prompt data unnecessarily
- Clients must never call Ollama directly
- AI inputs and outputs should specify locale when user-facing text is involved

## 8. Coding Standards

- Use strict TypeScript
- Use Zod for boundary validation
- Prefer shared utility functions over repeated helpers
- Prefer feature modules with clear ownership
- Keep UI components presentation-focused
- Keep server orchestration separate from rendering
- Use descriptive names
- Avoid one-letter abstractions
- Favor explicit types at package boundaries
- Use shared locale utilities for dates, numbers, times, currencies, and units

## 9. Testing Minimums

- New shared packages require unit tests where logic exists
- New API routes require integration coverage where practical
- Critical web flows require Playwright coverage
- Tenant-sensitive changes require permission tests
- Chat changes require realtime and read-state verification

## 10. Prohibited Shortcuts

- Do not duplicate types between apps
- Do not bypass `packages/contracts`
- Do not call Supabase with elevated privileges from client code
- Do not call Ollama from clients
- Do not rely only on UI for permissions
- Do not add a new shared package without clear reuse reason
- Do not introduce a second backend pattern without updating the technical plan
- Do not ship new client-facing features without translation keys, locale formatting, and safe fallback behavior

## 11. Change Management

- Major architectural deviations must update `docs/07-technical-plan.md`
- Repo-wide conventions must update `AGENT.md`
- Implementation should follow these docs unless explicitly superseded
