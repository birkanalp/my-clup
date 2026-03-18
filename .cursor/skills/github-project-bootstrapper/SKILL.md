---
name: github-project-bootstrapper
description: Prepare GitHub project management structure for MyClup's agent-driven workflow using the repository's current label taxonomy, issue templates, and project fields.
---

# GitHub Project Bootstrapper

## Purpose

Generate a setup plan for GitHub labels, issue templates, and GitHub Project structure that matches the current repository workflow.

## Canonical Labels

### Owner

- `owner:orchestrator`
- `owner:pm`
- `owner:architect`
- `owner:backend`
- `owner:web`
- `owner:mobile`
- `owner:ai`
- `owner:qa`
- `owner:review`
- `owner:release`

### State

- `state:proposed`
- `state:clarified`
- `state:scoped`
- `state:assigned`
- `state:in-progress`
- `state:implemented`
- `state:tested`
- `state:reviewed`
- `state:approved`
- `state:integrated`
- `state:done`
- `state:blocked`

### Type

- `type:feature`
- `type:bug`
- `type:tech-debt`
- `type:docs`
- `type:infra`

### Priority

- `priority:p0`
- `priority:p1`
- `priority:p2`

### Surface

- `surface:mobile-user`
- `surface:mobile-admin`
- `surface:web-gym-admin`
- `surface:web-platform-admin`
- `surface:web-site`
- `surface:shared`

## Issue Template Expectations

- Use GitHub issue forms in `.github/ISSUE_TEMPLATE/*.yml`
- Disable blank issues when structured issue intake is required
- Capture the canonical fields defined in `docs/github-workflow.md`
- Keep epic templates as planning containers and child issues as executable records

## Project Field Recommendations

Use these fields:

- `Status`: mirrors lifecycle labels
- `Owner`: free-text mirror of the active owner label
- `Priority`
- `Surface`
- `Type`
- `Risk Level`

## Project Views

- Workflow Board grouped by `Status`
- Owner Board grouped by `Owner`
- Surface Board grouped by `Surface`
- Priority Table sorted by `Priority`

## Rules

- GitHub Issues remain the operational source of truth
- GitHub Project is a dashboard only
- Exactly one owner label and one lifecycle label may be active at a time
- Handoffs require label updates plus a summary comment
- Blocked work requires `state:blocked` plus a blocker comment
