---
name: github-issue-template-generator
description: Generate implementation-ready GitHub Issue bodies for features, tasks, epics, or subsystem changes using the repository's canonical workflow fields.
---

# GitHub Issue Template Generator

## Purpose

Generate a copy-paste ready GitHub Issue body for implementation work. Align with `docs/08-agentic-workflow.md`, `docs/github-workflow.md`, and the repository issue templates.

## Required Fields

Every generated implementation issue body must include:

- Summary
- Source Documentation
- Scope
- Owning Agent
- Collaborating Agents
- Affected Apps
- Files or Packages in Scope
- Dependencies
- Acceptance Criteria
- Required Tests
- Localization Impact
- Risk Level

## Canonical Labels

- owner: `owner:orchestrator`, `owner:pm`, `owner:architect`, `owner:backend`, `owner:web`, `owner:mobile`, `owner:ai`, `owner:qa`, `owner:review`, `owner:release`
- state: `state:proposed`, `state:clarified`, `state:scoped`, `state:assigned`, `state:in-progress`, `state:implemented`, `state:tested`, `state:reviewed`, `state:approved`, `state:integrated`, `state:done`, `state:blocked`
- type: `type:feature`, `type:bug`, `type:tech-debt`, `type:docs`, `type:infra`
- priority: `priority:p0`, `priority:p1`, `priority:p2`
- surface: `surface:mobile-user`, `surface:mobile-admin`, `surface:web-gym-admin`, `surface:web-platform-admin`, `surface:web-site`, `surface:shared`

Epic issues are planning containers and may omit a type label if none of the existing type labels fits cleanly.

## Rules

- Acceptance criteria must use checklist syntax
- Use only apps and packages defined by the technical plan
- Keep scope conservative
- Cite source documentation
- Output must be paste-ready for GitHub
