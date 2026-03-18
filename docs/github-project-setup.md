# GitHub Project Setup

## 1. Purpose

GitHub Project is the repository dashboard layer.

- GitHub Issues remain the operational source of truth.
- GitHub Project mirrors issue labels and selected metadata for reporting.

## 2. Standard Project

- Name: `MyClup Development`

The setup script in `scripts/setup-github-project.sh` is an optional bootstrap helper. This document is the durable reference for how the project should look.

## 3. Required Fields

### Status

Single select values aligned to lifecycle labels:

- `proposed`
- `clarified`
- `scoped`
- `assigned`
- `in-progress`
- `implemented`
- `tested`
- `reviewed`
- `approved`
- `integrated`
- `done`
- `blocked`

### Owner

Free-text field that mirrors the active `owner:*` label.

### Priority

Single select:

- `p0`
- `p1`
- `p2`

### Surface

Single select:

- `mobile-user`
- `mobile-admin`
- `web-gym-admin`
- `web-platform-admin`
- `web-site`
- `shared`

### Type

Single select:

- `feature`
- `bug`
- `tech-debt`
- `docs`
- `infra`

### Risk Level

Single select:

- `low`
- `medium`
- `high`

## 4. Required Views

### Workflow Board

- board layout
- grouped by `Status`

### Owner Board

- board layout
- grouped by `Owner`

### Surface Board

- board layout
- grouped by `Surface`

### Priority Table

- table layout
- sorted by `Priority`

## 5. Alignment Rules

- The issue must be corrected before the project item when they differ.
- Exactly one owner label should map to the `Owner` field.
- Exactly one lifecycle label should map to the `Status` field.
- Type, priority, surface, and risk should stay aligned where relevant.
- Project updates never replace required issue comments.

## 6. Handoff and Blocked Work

When issue labels change in a meaningful way, update the project item so the dashboard stays useful.

When work is blocked:

- issue label: `state:blocked`
- project status: `blocked`
- issue comment: required blocker comment

## 7. Completion Rules

Project status must not be set to `done` before the issue is actually `state:done`.
