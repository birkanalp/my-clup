# GitHub Workflow

## 1. Role of GitHub

- GitHub Issues are the operational source of truth.
- GitHub Project mirrors issue state for visibility only.
- Issue labels are the live workflow record for ownership and lifecycle.

If issue state and project state diverge, fix the issue first.

## 2. Required Issue Structure

Every implementation issue must contain:

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

The issue templates in `.github/ISSUE_TEMPLATE/` are the standard way to capture these fields.

## 3. Label Rules

### 3.1 Owner Labels

Exactly one owner label may be active on an issue at a time:

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

### 3.2 Lifecycle Labels

Exactly one lifecycle label may be active on an issue at a time:

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

### 3.3 Supporting Labels

Type:

- `type:feature`
- `type:bug`
- `type:tech-debt`
- `type:docs`
- `type:infra`

Priority:

- `priority:p0`
- `priority:p1`
- `priority:p2`

Surface:

- `surface:mobile-user`
- `surface:mobile-admin`
- `surface:web-gym-admin`
- `surface:web-platform-admin`
- `surface:web-site`
- `surface:shared`

Epic issues are planning containers and may omit a type label if none of the existing type labels fits cleanly.

## 4. Lifecycle Meaning

- `state:proposed`: work captured but not yet clarified
- `state:clarified`: intent and expected outcome are understood
- `state:scoped`: execution boundary and dependencies are defined
- `state:assigned`: an active owner is set and the issue is ready to start
- `state:in-progress`: active implementation or preparation work is underway
- `state:implemented`: the intended change has been built
- `state:tested`: required validation evidence exists
- `state:reviewed`: blocking review has passed
- `state:approved`: required approval or release signoff is recorded
- `state:integrated`: the approved change is merged or otherwise integrated
- `state:done`: the workflow is complete
- `state:blocked`: work cannot continue safely

## 5. Handoff Rules

Every handoff must:

1. remove the current owner label
2. add the next owner label
3. update the lifecycle label when the state changed
4. leave a summary comment

The summary comment must include:

- what was completed
- what remains
- changed files or packages
- test status
- localization implications
- known risks

Use `docs/workflow-templates/handoff.md`.

## 6. Blocked Work Rules

When work is blocked:

1. apply `state:blocked`
2. keep ownership with the role that can resolve the blocker
3. leave a blocker comment

The blocker comment must include:

- blocker summary
- root cause
- why work cannot safely continue
- decision or dependency needed
- who must unblock it

Use `docs/workflow-templates/blocker.md`.

## 7. Review Gate

Before handoff to `owner:review`, the issue must have:

- the latest implementation summary or handoff comment
- test evidence
- localization impact note
- unresolved blocker list, even if empty

Do not apply `state:reviewed` until review is complete.

Use `docs/workflow-templates/review.md`.

## 8. Release Gate

Do not move an issue to `state:done` until:

- review is complete
- approval is recorded when required
- integration is complete
- release-sensitive checks are complete when applicable

Use `docs/workflow-templates/release.md`.

## 9. Project Relationship

GitHub Project mirrors:

- lifecycle state via the `Status` field
- current owner via the `Owner` field
- type, priority, surface, and risk where relevant

Project items do not replace issue labels or issue comments.
