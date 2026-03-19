# MyClup Agentic Workflow

## 1. Purpose

This document is the canonical workflow guide for agent-driven work in this repository.

It defines:

- the GitHub-driven delivery model
- the lifecycle and label vocabulary
- the required handoff, blocker, review, and release behavior
- the active agent and skill inventory used by this repository

Detailed behavioral instructions live in:

- `.cursor/rules/*.mdc`
- `.cursor/agents/*.md`
- `.cursor/skills/*/SKILL.md`

Those files must stay aligned with this document.

## 2. Precedence

Use this order when workflow guidance conflicts:

1. `docs/07-technical-plan.md` for architecture and technical constraints
2. `AGENT.md` for repository-wide engineering defaults
3. `docs/08-agentic-workflow.md` for agentic workflow and GitHub operating rules
4. `docs/00-master-plan.md` for roadmap intent
5. `docs/01-user-app-plan.md` through `docs/06-addon-packages-plan.md` for product-specific scope

If a conflict cannot be resolved safely, stop and escalate to a human.

## 3. Core Operating Rules

- GitHub Issues are the operational source of truth.
- GitHub Project is a visibility and reporting layer only.
- Every implementation task must map to a GitHub Issue before execution begins.
- When creating tasks under an Epic, follow `docs/workflow-templates/task-creation-protocol.md` (add to Project, link via `addSubIssue`). A task is not fully created until both steps are done.
- Every active issue must have exactly one `owner:*` label.
- Every active issue must have exactly one `state:*` lifecycle label.
- Work must not begin until the issue is at least `state:scoped` and has an active owner.
- Handoffs require both label updates and a durable summary comment.
- Blocked work requires `state:blocked` and a blocker comment that explains the unblock condition.
- Review is a blocking gate.
- Release-sensitive work requires a release gate and recorded approval before `state:done`.
- Client-facing work is not complete without localization review.
- Scope ownership must be explicit before parallel work begins.

## 4. Canonical Labels

### 4.1 Owner Labels

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

### 4.2 Lifecycle Labels

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

### 4.3 Supporting Labels

Type labels:

- `type:feature`
- `type:bug`
- `type:tech-debt`
- `type:docs`
- `type:infra`

Priority labels:

- `priority:p0`
- `priority:p1`
- `priority:p2`

Surface labels:

- `surface:mobile-user`
- `surface:mobile-admin`
- `surface:web-gym-admin`
- `surface:web-platform-admin`
- `surface:web-site`
- `surface:shared`

## 5. Required Issue Content

Every implementation issue must include:

- Summary
- Source documentation references
- Scope, including out-of-scope boundaries
- Owning agent
- Collaborating agents, or `None`
- Files or packages in scope
- Dependencies, or `None`
- Acceptance criteria
- Required tests
- Localization impact
- Risk level

Epics are planning containers. They should still capture source documentation, scope, ownership, dependencies, success criteria, localization impact, and risks, but their child issues remain the executable records.

## 6. Workflow Stages

### 6.1 Intake and Scoping

The Orchestrator Agent and PM-oriented workflow create or refine the issue until:

- the task is traceable to repo docs
- the scope is explicit
- dependencies are known
- ownership is clear

The issue should normally move through:

`state:proposed` → `state:clarified` → `state:scoped` → `state:assigned`

### 6.2 Architecture Alignment

Use `owner:architect` when contract boundaries, shared packages, auth, tenant safety, localization foundations, chat architecture, or AI service boundaries need architectural review before implementation.

### 6.3 Implementation

Implementation owners are:

- `owner:backend`
- `owner:web`
- `owner:mobile`
- `owner:ai`

Implementation work should normally move to:

- `state:in-progress` when active work begins
- `state:implemented` when the coded change is complete **and** the GitHub delivery steps are done (branch, commit, push, PR creation, issue comment, lifecycle update)

Implementation is **not** complete until a PR has been created or an explicit blocker has been documented. See `.cursor/agents/*-agent.md` (backend, web, mobile, ai) for the required GitHub delivery steps before handoff to QA.

### 6.4 Validation

`owner:qa` validates required tests, localization obligations, and blocking quality gaps.

Validation should move the issue to:

- `state:tested` when the required validation evidence exists
- `state:blocked` when quality blockers prevent review

### 6.5 Review

`owner:review` performs blocking review.

Review should move the issue to:

- `state:reviewed` when review passes
- `state:blocked` when changes are required before approval can continue

### 6.6 Approval, Integration, and Release

`owner:release` is responsible for release-sensitive approval and readiness checks.

Typical progression after review:

- `state:approved` when release or human signoff is recorded
- `state:integrated` when the approved change is merged or otherwise integrated into the target delivery line
- `state:done` when the full workflow is complete

If a task is not release-sensitive, the orchestrator may still require `state:approved` and `state:integrated` before `state:done` so the lifecycle remains traceable.

## 7. Handoff and Blocker Protocol

### 7.1 Handoff

Every handoff must:

1. remove the current owner label
2. add the next owner label
3. replace the lifecycle label if the state changed
4. leave a summary comment that includes:
   - what was completed
   - what remains
   - changed files or packages
   - test status
   - localization implications
   - known risks

### 7.2 Blocked Work

Blocked work must:

1. apply `state:blocked`
2. keep ownership explicit with the role that can resolve the blocker
3. leave a blocker comment that includes:
   - blocker summary
   - root cause
   - why work cannot safely continue
   - decision or dependency needed
   - who must unblock it

## 8. Review and Release Gates

Before handoff to `owner:review`, the issue must contain:

- the latest implementation summary or handoff comment
- test evidence
- localization impact note
- unresolved blocker list, even if the list is empty

Do not mark an issue `state:reviewed` without review completion.

Do not mark an issue `state:done` until:

- review is complete
- approval is recorded when required
- integration is complete
- release-sensitive checks are complete when applicable

## 9. Active Agent Inventory

These are the active repository agent definitions:

| Agent file                                     | Operational role                             |
| ---------------------------------------------- | -------------------------------------------- |
| `.cursor/agents/orchestrator-agent.md`         | `owner:orchestrator`                         |
| `.cursor/agents/business-analyst-agent.md`     | supports `owner:pm` workflows                |
| `.cursor/agents/product-architecture-agent.md` | `owner:architect`                            |
| `.cursor/agents/prompt-agent.md`               | supports orchestration and handoff packaging |
| `.cursor/agents/backend-agent.md`              | `owner:backend`                              |
| `.cursor/agents/web-agent.md`                  | `owner:web`                                  |
| `.cursor/agents/mobile-agent.md`               | `owner:mobile`                               |
| `.cursor/agents/ai-agent.md`                   | `owner:ai`                                   |
| `.cursor/agents/qa-agent.md`                   | `owner:qa`                                   |
| `.cursor/agents/review-agent.md`               | `owner:review`                               |
| `.cursor/agents/release-agent.md`              | `owner:release`                              |

Supporting agent files may exist without a dedicated label. Operational issue ownership still uses the owner label set defined in Section 4.

## 10. Active Skill Inventory

These are the active repository skill definitions:

### 10.1 Grounding and Planning

- `doc-context-analyzer`
- `task-scope-generator`
- `implementation-task-splitter`
- `github-issue-template-generator`

### 10.2 Workflow and Governance

- `github-handoff-manager`
- `github-blocker-escalation-writer`
- `github-project-bootstrapper`

### 10.3 Validation and Release

- `code-review-checker`
- `localization-audit`
- `test-plan-generator`
- `release-readiness-check`

### 10.4 Architecture and Domain Skills

- `api-contract-generator`
- `database-schema-planner`
- `chat-feature-planner`
- `ai-feature-designer`
- `monorepo-structure-generator`

## 11. Parallelism Rules

Parallel work is allowed only when:

- file ownership does not overlap
- package ownership does not overlap
- contract dependencies are already resolved
- integration points are explicit

If scopes overlap, the Orchestrator Agent must sequence the work or route the boundary to Product Architecture for explicit integration planning.

## 12. Change Control for Workflow Assets

When workflow guidance changes:

- update the canonical docs in `docs/`
- update `.cursor/rules` when enforcement language changes
- update `.cursor/agents` and `.cursor/skills` when role behavior changes
- update issue templates and workflow templates when required issue/comment structure changes

Do not keep duplicate rule text in multiple places when one file can be canonical and the others can reference it.
