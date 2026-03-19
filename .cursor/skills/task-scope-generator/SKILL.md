---
name: task-scope-generator
description: Convert feature requests into precise engineering task specifications aligned with the MyClup workflow and technical plan.
---

# Task Scope Generator

## Purpose

Convert a feature description into a precise engineering scope. Output must stay aligned with `docs/07-technical-plan.md` and `docs/08-agentic-workflow.md`. Do **not** invent architecture.

## Workflow

1. Ground the request in `docs/07-technical-plan.md`, `AGENT.md`, `docs/08-agentic-workflow.md`, and the relevant product plans.
2. Map the work to existing apps, packages, API boundaries, and tenant rules.
3. Emit a task spec and a GitHub Issue body draft.

## Suggested Labels

Use only this canonical label set:

| Dimension | Allowed values                                                                                                                                                                                                         |
| --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| owner     | `owner:orchestrator`, `owner:pm`, `owner:architect`, `owner:backend`, `owner:web`, `owner:mobile`, `owner:ai`, `owner:qa`, `owner:review`, `owner:release`                                                             |
| state     | `state:proposed`, `state:clarified`, `state:scoped`, `state:assigned`, `state:in-progress`, `state:implemented`, `state:tested`, `state:reviewed`, `state:approved`, `state:integrated`, `state:done`, `state:blocked` |
| type      | `type:feature`, `type:bug`, `type:tech-debt`, `type:docs`, `type:infra`                                                                                                                                                |
| priority  | `priority:p0`, `priority:p1`, `priority:p2`                                                                                                                                                                            |
| surface   | `surface:mobile-user`, `surface:mobile-admin`, `surface:web-gym-admin`, `surface:web-platform-admin`, `surface:web-site`, `surface:shared`                                                                             |

## Output Structure

Emit:

- task title
- summary
- suggested labels
- source documentation
- affected apps
- affected packages
- dependencies
- required APIs
- required database entities
- UI surfaces impacted
- chat, AI, and localization implications
- acceptance criteria
- testing requirements
- risk assessment
- GitHub Issue body draft

## Rules

- No architecture invention
- Every scope element must be traceable to a doc
- Keep scope conservative
- Always include testing requirements
- Always include localization implications for client-facing work
- Note RLS and permission requirements when tenant-owned data is involved
