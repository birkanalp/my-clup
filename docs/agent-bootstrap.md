# Agent Bootstrap

## 1. Purpose

This checklist initializes the repository workflow safely before planning or implementation work begins.

## 2. Read First

Before doing substantive work, read:

- `docs/07-technical-plan.md`
- `AGENT.md`
- `docs/08-agentic-workflow.md`
- `docs/github-workflow.md`
- `docs/github-project-setup.md`
- `docs/github-automation.md`

Then read the relevant product plan documents in `docs/00` through `docs/06`.

## 3. Bootstrap Checklist

### 3.1 Repository Context

- scan the repo structure
- identify the relevant apps, packages, rules, agents, and skills
- confirm whether the task is implementation, planning, review, or release work

### 3.2 GitHub Context

When GitHub access is available:

- inspect the active issue
- inspect current labels
- inspect related issues and dependencies
- inspect the linked GitHub Project item if one exists

When GitHub access is not available:

- rely on the durable repo docs and templates
- treat any missing live GitHub context as a blocker if it affects safe execution

### 3.3 Issue Readiness

Before implementation starts, confirm the issue contains:

- summary
- source documentation references
- explicit scope
- owning agent
- collaborating agents, or `None`
- files or packages in scope
- dependencies, or `None`
- acceptance criteria
- required tests
- localization impact
- risk level

### 3.4 Label Readiness

Before implementation starts, confirm:

- exactly one active `owner:*` label
- exactly one active `state:*` label
- the issue is at least `state:scoped`
- the issue has an active owner before work begins

## 4. Handoff and Blockers

- Use `docs/workflow-templates/handoff.md` for ownership transfer.
- Use `docs/workflow-templates/blocker.md` when safe progress stops.
- Do not hand off or block work silently.

## 5. Bootstrap Asset Rules

- Durable workflow assets live in `docs/`, `.github/ISSUE_TEMPLATE/`, `.cursor/rules/`, `.cursor/agents/`, and `.cursor/skills/`.
- One-time setup scripts in `scripts/` should not be recreated during normal feature work.
- Only use or update bootstrap scripts when you are intentionally maintaining the repository setup itself.
