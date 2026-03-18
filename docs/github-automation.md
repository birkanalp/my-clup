# GitHub Automation

## 1. Purpose

Automation may help keep issue labels, comments, and project fields aligned with the workflow. It does not replace human judgment or the canonical docs.

## 2. Allowed Automation Behavior

Automation may:

- add or replace workflow labels
- leave workflow comments using the templates in `docs/workflow-templates/`
- mirror label changes into GitHub Project fields
- assign the next operational owner when the handoff is explicit

## 3. Forbidden Automation Behavior

Automation must not:

- silently change task scope
- create or remove owner labels without a matching handoff decision
- apply `state:blocked` without a blocker comment
- apply `state:reviewed` before review is complete
- apply `state:done` before approval and integration requirements are satisfied
- bypass localization, testing, review, or release gates

## 4. Required Comment Types

Use the durable repository templates:

- `docs/workflow-templates/handoff.md`
- `docs/workflow-templates/blocker.md`
- `docs/workflow-templates/review.md`
- `docs/workflow-templates/release.md`

## 5. Safety Rules

- Keep exactly one active `owner:*` label.
- Keep exactly one active `state:*` label.
- Keep issue and project state aligned.
- Keep blocker ownership explicit.
- Leave a durable issue trail for all handoffs, review decisions, and release decisions.
