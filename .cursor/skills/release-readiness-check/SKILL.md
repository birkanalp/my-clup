---
name: release-readiness-check
description: Validate whether a feature or milestone is ready for release. Outputs readiness summary, blockers, deployment considerations, and lifecycle transitions aligned to the repository workflow.
---

# Release Readiness Check

## Purpose

Validate whether a feature or milestone is ready for release. Human approval remains mandatory; this skill prepares the readiness report.

## Checks

- tests passing
- localization coverage
- migration safety
- contract stability
- security validation
- observability coverage

## Lifecycle Guidance

When status is `READY`, recommend:

1. `state:approved` when approval or signoff is recorded
2. `state:integrated` when the change is merged or integrated
3. `state:done` when the workflow is fully complete

When status is `NOT READY`, keep or move to `state:blocked`.

## Blocking Conditions

Release must not proceed if:

- required tests are missing or failing
- approval is missing
- review blockers are unresolved
- migration safety is not understood
- critical security or tenant-safety gaps exist
- localization coverage is missing on client-facing work
- contract drift exists between client and server
- sensitive flows lack audit logging

## Rules

- be specific about blockers
- include deployment considerations only when relevant
- do not treat review approval as release approval
- keep label transition suggestions aligned with the canonical lifecycle
