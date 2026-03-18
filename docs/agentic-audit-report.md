# 1. Summary

I reviewed the repository's agentic workflow surface across `docs/`, `.github/ISSUE_TEMPLATE/`, `.cursor/rules/`, `.cursor/agents/`, `.cursor/skills/`, and the GitHub setup scripts in `scripts/`. The setup had a usable foundation, but the workflow was fragmented across multiple duplicate sources with conflicting lifecycle terms, outdated agent and skill inventories, weak issue forms, and bootstrap assumptions that were too strong for normal repository operation.

The repository is now normalized around one workflow vocabulary: GitHub Issues are the operational source of truth, GitHub Project is the dashboard layer, one owner label and one lifecycle label stay active at a time, handoffs require label updates plus a durable summary comment, blocked work requires explicit blocker documentation, QA moves work to `state:tested`, review moves work to `state:reviewed`, and release approval is separate from code review.

# 2. Problems Found

- `docs/08-agentic-workflow.md` was the largest source of drift. It described many agents and skills that do not exist in `.cursor/agents/` or `.cursor/skills/`, used old names like `Test Agent` and `Code Reviewer Agent`, and mixed `in_progress` with `state:in-progress`.
- Workflow precedence was inconsistent. `docs/08-agentic-workflow.md` was treated as canonical workflow guidance in some places but was omitted from the formal precedence order in `.cursor/rules/docs-first-and-precedence.mdc` and `.cursor/agents/orchestrator-agent.md`.
- Review and release semantics were blurred. `.cursor/rules/review-gates-and-definition-of-done.mdc` used the nonexistent `state:review`, QA guidance pushed directly toward `state:reviewed`, and review guidance could imply release approval.
- `.cursor/rules/task-scope-ownership-and-parallelism.mdc` used `state:in_progress` and referenced an `Integration Agent` that is not part of the active agent set.
- `.cursor/rules/github-issue-driven-delivery.mdc` and several related files omitted `Summary` from the required issue fields even though the templates and docs depend on it.
- Owner and lifecycle exclusivity were under-specified. Several docs required exactly one owner label, but the repo did not consistently say exactly one lifecycle label must also be active.
- GitHub issue templates were too weak for safe operation. They made source documentation optional, did not require collaborating agents or concrete scope paths, kept suggested labels instead of explicit owner fields, and allowed structurally incomplete issues.
- The epic template did not align with the implementation issue rules and did not distinguish between planning-container epics and executable child issues clearly enough.
- Blank GitHub issues were still allowed, which weakens the issue-driven workflow by letting work bypass the structured fields.
- Script readmes duplicated canonical project and label information instead of deferring to durable docs.
- Several skills generated obsolete label taxonomies or unsupported values such as `type:bugfix`, `type:refactor`, `type:chore`, `type:epic`, `priority:p3`, and `surface:api`.
- Several skills and docs still assumed agent roles that are not defined in the current repo, such as `Frontend Architecture Agent`, `DB Admin Agent`, `Localization Agent`, `Security / Compliance Agent`, `Integration Agent`, `Analytics Agent`, and `Content / SEO Agent`.
- Finder `.DS_Store` files were committed in workflow-critical directories and added unnecessary clutter.
- The repository had no `.gitignore`, so Finder metadata could easily re-enter the working tree.
- The bootstrap docs assumed agents could always inspect live GitHub issues, labels, and project configuration, which is not a safe assumption for every execution environment.

# 3. Fixes Applied

- `docs/08-agentic-workflow.md`: Rewrote the canonical workflow doc to match the actual active rule, agent, and skill inventory; normalized lifecycle terms; separated QA, review, approval, integration, and done.
- `docs/github-workflow.md`: Rewrote the GitHub workflow doc around exact owner and lifecycle rules, required issue fields, handoff protocol, blocked protocol, and gate requirements.
- `docs/github-project-setup.md`: Rewrote the project-setup doc so it mirrors issue truth instead of competing with it; normalized fields and views to the canonical labels.
- `docs/github-automation.md`: Simplified automation guidance so it references the canonical workflow and blocks unsafe automation behaviors.
- `docs/agent-bootstrap.md`: Rewrote bootstrap guidance to distinguish durable repo assets from live GitHub context and to stop assuming GitHub access is always available.
- `docs/workflow-templates/handoff.md`: Expanded the handoff template to include from/to, remaining work, tests, localization, risks, and label changes.
- `docs/workflow-templates/blocker.md`: Expanded the blocker template to require root cause, safe-stop rationale, unblock owner, and temporary label changes.
- `docs/workflow-templates/review.md`: Expanded the review template to require evidence reviewed, findings, label changes, and explicit action required.
- `docs/workflow-templates/release.md`: Expanded the release template to include gate checklist, blockers, deployment notes, and state transition guidance.
- `.github/ISSUE_TEMPLATE/feature.yml`: Rebuilt the feature form around required workflow fields and explicit owner selection.
- `.github/ISSUE_TEMPLATE/task.yml`: Rebuilt the task form around required workflow fields and explicit owner selection.
- `.github/ISSUE_TEMPLATE/bug.yml`: Rebuilt the bug form to include current behavior plus the same operational workflow fields required for execution.
- `.github/ISSUE_TEMPLATE/tech-debt.yml`: Rebuilt the tech-debt form around explicit workflow and scope fields.
- `.github/ISSUE_TEMPLATE/epic.yml`: Rebuilt the epic form as a planning container with ownership, scope, child issue plan, localization, and risk tracking.
- `.github/ISSUE_TEMPLATE/config.yml`: Added `blank_issues_enabled: false` so issue intake goes through structured templates.
- `.cursor/rules/docs-first-and-precedence.mdc`: Added `docs/08-agentic-workflow.md` to the formal precedence order.
- `.cursor/rules/github-issue-driven-delivery.mdc`: Added `Summary`, clarified lifecycle ownership, and aligned close conditions with review and approval requirements.
- `.cursor/rules/github-label-handoff-governance.mdc`: Added the exactly-one-lifecycle-label rule and strengthened handoff/blocker comment requirements.
- `.cursor/rules/review-gates-and-definition-of-done.mdc`: Fixed the invalid `state:review` reference and separated tested, reviewed, approved, integrated, and done semantics.
- `.cursor/rules/task-scope-ownership-and-parallelism.mdc`: Fixed old lifecycle names, added `Summary`, and replaced nonexistent integration-role references with explicit orchestrator and product-architecture routing.
- `.cursor/agents/orchestrator-agent.md`: Aligned precedence and lifecycle rules with the canonical docs.
- `.cursor/agents/business-analyst-agent.md`: Normalized the suggested label taxonomy to the actual repo labels.
- `.cursor/agents/prompt-agent.md`: Updated QA/review prompt expectations to the correct lifecycle states.
- `.cursor/agents/qa-agent.md`: Corrected QA output so passing validation recommends `state:tested`, not `state:reviewed`.
- `.cursor/agents/review-agent.md`: Removed the approval/release ambiguity and made review responsible for `state:reviewed` or `state:blocked` only.
- `.cursor/agents/release-agent.md`: Clarified the progression from `state:reviewed` to `state:approved` to `state:integrated` to `state:done`.
- `.cursor/skills/doc-context-analyzer/SKILL.md`: Updated document precedence to include the canonical workflow doc.
- `.cursor/skills/task-scope-generator/SKILL.md`: Normalized label values to the actual repo taxonomy.
- `.cursor/skills/github-issue-template-generator/SKILL.md`: Normalized generated issue fields and labels to the current workflow.
- `.cursor/skills/github-project-bootstrapper/SKILL.md`: Rewrote the bootstrap skill to match current labels, issue forms, and project fields instead of an older label scheme.
- `.cursor/skills/github-handoff-manager/SKILL.md`: Corrected lifecycle guidance for implementation, QA, review, approval, integration, and completion.
- `.cursor/skills/code-review-checker/SKILL.md`: Removed the implied jump from review to approval and aligned review output with `state:reviewed`.
- `.cursor/skills/release-readiness-check/SKILL.md`: Corrected release lifecycle guidance to include integration before done.
- `.cursor/skills/implementation-task-splitter/SKILL.md`: Removed dependence on unsupported `type:epic` labeling and aligned task ownership to the actual workflow.
- `scripts/README-labels.md`: Reduced duplication and pointed label canon to durable docs instead of letting the script readme define the workflow.
- `scripts/README-project.md`: Reduced duplication and pointed project canon to the durable project-setup doc.
- `.gitignore`: Added minimal ignore rules for `.DS_Store` so Finder metadata stops polluting the tracked workflow setup.
- `.DS_Store`: Removed the root Finder metadata file.
- `.cursor/.DS_Store`: Removed the Finder metadata file.
- `.cursor/skills/.DS_Store`: Removed the Finder metadata file.
- `.github/.DS_Store`: Removed the Finder metadata file.
- `docs/.DS_Store`: Removed the Finder metadata file.
- `packages/.DS_Store`: Removed the Finder metadata file.

# 4. Scripts Removed or Kept

- `scripts/setup-github-labels-gh.sh`: Kept. It still provides a valid bootstrap path for recreating labels from the canonical docs, and I could not verify from repo-local state whether the live GitHub labels have already been created everywhere they are needed.
- `scripts/setup-github-labels.py`: Kept. It is redundant with the `gh` script operationally, but it remains a secondary bootstrap path and I could not safely conclude it is no longer needed.
- `scripts/setup-github-project.sh`: Kept. It still provides a valid one-time or repair bootstrap path for GitHub Project setup, and I could not verify the live project state from local repo contents alone.

# 5. Remaining Risks

- I did not remove the GitHub setup scripts because I could not verify whether they have already been executed successfully in the live GitHub environment or whether they are still used for re-bootstrap.
- I could not verify live GitHub labels, project fields, or issue-template behavior against the actual hosted repository because this audit was repo-local rather than a live GitHub administration run.
- The repo is not a Git checkout in this environment, so I could not use git history or `git status` to compare the normalized setup against prior repository state.
- macOS recreated a root `.DS_Store` during verification; the new `.gitignore` prevents that clutter from mattering in normal git-tracked usage, but I cannot guarantee the local file will stay absent outside version control.
- The workflow now has a clear canonical doc set, but future drift is still possible if `.cursor/rules`, `.cursor/agents`, `.cursor/skills`, and `docs/` are edited independently without maintaining the precedence model added in this audit.

# 6. Final Recommended Structure

- `docs/`
  Keep `docs/08-agentic-workflow.md` as the canonical workflow vocabulary and lifecycle guide.
  Keep `docs/github-workflow.md` as the canonical GitHub issue and label operating guide.
  Keep `docs/github-project-setup.md` as the canonical project-dashboard reference.
  Keep `docs/github-automation.md` as the automation guardrail doc.
  Keep `docs/agent-bootstrap.md` as the start-of-task checklist.
  Keep `docs/workflow-templates/` for durable comment templates only.
  Keep `docs/agentic-audit-report.md` as the audit artifact for this normalization pass.

- `workflow templates`
  `docs/workflow-templates/handoff.md` for ownership transfer.
  `docs/workflow-templates/blocker.md` for blocked-state escalation.
  `docs/workflow-templates/review.md` for blocking review decisions.
  `docs/workflow-templates/release.md` for release readiness and signoff.

- `issue templates`
  `.github/ISSUE_TEMPLATE/*.yml` should remain the required structured intake path.
  `.github/ISSUE_TEMPLATE/config.yml` should keep blank issues disabled.
  Epics should remain planning containers; child issues should remain executable records.

- `rules`
  `.cursor/rules/` should hold enforcement language only.
  Workflow rules should reference the canonical lifecycle and label set defined in `docs/08-agentic-workflow.md` and `docs/github-workflow.md`.
  Architecture rules should continue to defer to `docs/07-technical-plan.md`.

- `skills`
  `.cursor/skills/` should contain reusable generators and checkers that emit the same owner labels, lifecycle labels, and issue fields used by the durable docs.
  Skills should not define alternate taxonomies or alternate agent inventories.

- `agents`
  `.cursor/agents/` should reflect the active repo agent set only: orchestrator, business-analyst, product-architecture, prompt, backend, web, mobile, ai, qa, review, and release.
  Support agents without dedicated owner labels should be documented as supporting roles, not as alternate operational owner labels.
