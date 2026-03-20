# Task Creation Protocol

**When**: Every time a task issue is created under an Epic.

**Who**: The agent that creates the task (orchestrator, business-analyst-agent, or any agent creating Epic child tasks).

**Purpose**: Ensure every task is in the MyClup Development project and linked to its parent Epic. A task is **not** fully created until these steps are complete.

---

## Mandatory Steps (in order)

### 1. Create the issue

Create the GitHub issue with the full body (Summary, Source Documentation, Scope, Owning Agent, etc.). Include `**Part of Epic #N**` in the body.

### 2. Add to GitHub Project

Add the new issue to the project **MyClup Development** (project number 3 for `@me`):

```bash
gh project item-add 3 --owner @me --url https://github.com/birkanalp/my-clup/issues/<ISSUE_NUMBER>
```

Example for issue #97:

```bash
gh project item-add 3 --owner @me --url https://github.com/birkanalp/my-clup/issues/97
```

### 3. Link as sub-issue to parent Epic

Use the GitHub GraphQL `addSubIssue` mutation to link the task as a child of the Epic.

**Get node IDs** (parent Epic and new task):

```bash
gh api graphql -f query='
  query {
    repo: repository(owner: "birkanalp", name: "my-clup") {
      epic: issue(number: EPIC_NUMBER) { id number }
      task: issue(number: TASK_NUMBER) { id number }
    }
  }
'
```

Replace `EPIC_NUMBER` and `TASK_NUMBER` with the actual numbers.

**Link the task to the Epic**:

```bash
gh api graphql -f query='
  mutation {
    addSubIssue(input: {
      issueId: "PARENT_EPIC_NODE_ID",
      subIssueId: "TASK_NODE_ID"
    }) {
      subIssue { id number }
    }
  }
'
```

Replace `PARENT_EPIC_NODE_ID` with the Epic's `id` from the query. Replace `TASK_NODE_ID` with the task's `id`.

---

## Verification Checklist

Before considering the task creation complete:

- [ ] Issue exists in GitHub
- [ ] Issue body contains `**Part of Epic #N**`
- [ ] Issue is in the MyClup Development project (visible on project board)
- [ ] Issue is linked as sub-issue of the Epic (visible under Epic's sub-issues in GitHub UI)

---

## Bulk Creation

When creating multiple tasks from a decomposition document (e.g. Epic task split), repeat steps 2 and 3 for **each** created issue. Do not skip any task.

---

## References

- `.cursor/rules/github-project-and-autonomous-handoff.mdc` — Project sync and Epic-child rules
- `docs/08-agentic-workflow.md` — Workflow and lifecycle
- `.cursor/skills/implementation-task-splitter/SKILL.md` — Task decomposition
