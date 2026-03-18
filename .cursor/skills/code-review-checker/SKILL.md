---
name: code-review-checker
description: Automate review validation before merge. Outputs APPROVE, REQUEST_CHANGES, or BLOCK with label recommendations aligned to the repository lifecycle.
---

# Code Review Checker

## Purpose

Given a change set, verify compliance with MyClup rules and emit a structured review. Block approval if critical rules are violated.

## Verification Checklist

- architecture
- contract updates
- localization
- test coverage
- tenant safety
- chat safety
- AI schema validation

## Review Decision

Use exactly one:

- `APPROVE`
- `REQUEST_CHANGES`
- `BLOCK`

## Lifecycle Guidance

- `APPROVE`: recommend `state:reviewed`; route the next owner to `owner:release` for release-sensitive work or back to orchestration for integration sequencing
- `REQUEST_CHANGES`: keep ownership explicit with the fixing owner; use `state:blocked` only if progress cannot continue without intervention
- `BLOCK`: apply `state:blocked` and identify the resolver

Review approval must **not** be used as release approval. `state:approved` belongs to release or human signoff.

## Critical Blockers

Block if any of these exist:

- missing translation support on client-facing features
- API changes without contract updates
- schema changes affecting tenant data without RLS review
- chat changes without read-state or permission checks
- AI changes without schema validation
- critical flows without appropriate tests
- out-of-scope file changes without approval
- architecture drift from `docs/07-technical-plan.md`
- permission logic only in UI
- tenant checks skipped or client-provided tenant trusted
- cross-tenant access without audit logging

## Rules

- cite the relevant rule when possible
- point to concrete files or locations
- specify label changes explicitly
- always include an issue comment draft
