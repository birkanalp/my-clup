---
name: implementation-task-splitter
description: Break large engineering work into safe parallel tasks with explicit ownership, dependencies, and overlap warnings.
---

# Implementation Task Splitter

## Purpose

Given a feature specification, split work into discrete tasks across contracts, backend, mobile, web, and testing. For each task, specify owner role, files affected, dependencies, estimated complexity, and parallelization safety.

## Task Categories

- Contracts
- Backend
- Mobile
- Web
- Testing

## Dependency Order

1. Contracts first
2. Backend after contracts
3. Mobile and web after backend when scopes do not overlap
4. Testing after implementation, with explicit dependencies

## Parent and Child Issue Guidance

- Use a parent planning issue or epic to group child tasks
- Child issues remain the executable records
- Parent issues may omit a type label if no existing type label fits cleanly
- Child issues should use the canonical owner, state, type, priority, and surface labels

## Output Requirements

For each child task include:

- category
- parent reference
- recommended owner label
- next handoff label
- files affected
- dependencies
- complexity
- parallelization safety

Always emit overlap warnings for tasks marked safe to parallelize.

## Rules

- contracts before clients
- explicit file scope only
- no overlapping ownership without sequencing or integration planning
- testing tasks must never be omitted
- owner and next handoff labels must align with the canonical workflow

## Post-Creation Protocol (mandatory)

After creating each task issue from this output, the creating agent **must**:

1. Add the issue to the GitHub Project `MyClup Development` (`gh project item-add 3 --owner @me --url <issue-url>`)
2. Link the task to its parent Epic via GraphQL `addSubIssue` mutation

See `docs/workflow-templates/task-creation-protocol.md` for full steps.
