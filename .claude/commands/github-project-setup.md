Generate a setup plan for GitHub labels, issue templates, and GitHub Project structure for the MyClup repository.

This produces a ready-to-execute plan for bootstrapping or repairing the GitHub project management infrastructure.

Context or target (optional): $ARGUMENTS

## GitHub Labels Setup

Create these labels (or verify they exist):

### Owner Labels
- `owner:orchestrator` — color: #0075ca
- `owner:pm` — color: #0075ca
- `owner:architect` — color: #0075ca
- `owner:backend` — color: #e4e669
- `owner:web` — color: #e4e669
- `owner:mobile` — color: #e4e669
- `owner:ai` — color: #e4e669
- `owner:qa` — color: #d93f0b
- `owner:review` — color: #d93f0b
- `owner:release` — color: #d93f0b

### State Labels
- `state:proposed` — color: #ededed
- `state:clarified` — color: #ededed
- `state:scoped` — color: #bfdadc
- `state:assigned` — color: #bfdadc
- `state:in-progress` — color: #0075ca
- `state:implemented` — color: #0075ca
- `state:tested` — color: #0e8a16
- `state:reviewed` — color: #0e8a16
- `state:approved` — color: #0e8a16
- `state:integrated` — color: #0e8a16
- `state:done` — color: #6f42c1
- `state:blocked` — color: #d93f0b

### Type Labels
- `type:feature` — color: #0075ca
- `type:bug` — color: #d73a4a
- `type:tech-debt` — color: #e4e669
- `type:docs` — color: #0075ca
- `type:infra` — color: #e4e669

### Priority Labels
- `priority:p0` — color: #d93f0b
- `priority:p1` — color: #e4e669
- `priority:p2` — color: #0075ca

### Surface Labels
- `surface:mobile-user` — color: #bfdadc
- `surface:mobile-admin` — color: #bfdadc
- `surface:web-gym-admin` — color: #bfdadc
- `surface:web-platform-admin` — color: #bfdadc
- `surface:web-site` — color: #bfdadc
- `surface:shared` — color: #ededed

## GitHub Project: "MyClup Development"

### Required Fields
- **Status** — mirrors lifecycle labels (single select matching state values)
- **Owner** — free text or single select matching owner labels
- **Priority** — single select: p0, p1, p2
- **Surface** — single select matching surface labels
- **Type** — single select matching type labels
- **Risk Level** — single select: low, medium, high

### Recommended Views
1. **Workflow Board** — grouped by Status
2. **Owner Board** — grouped by Owner
3. **Surface Board** — grouped by Surface
4. **Priority Table** — table view sorted by Priority

## Issue Template Structure

Create `.github/ISSUE_TEMPLATE/` with:

- `feature.yml` — implementation task template with all canonical fields
- `epic.yml` — planning container (minimal required fields)
- `bug.yml` — bug report template

Disable blank issues once structured templates are in place.

## Governance Rules (for reference)

- GitHub Issues are the operational source of truth
- GitHub Project is a visibility dashboard only
- Exactly one `owner:*` label active at a time
- Exactly one `state:*` label active at a time
- Handoffs require: remove old owner label + add new owner label + summary comment
- Blocked work requires: `state:blocked` + blocker comment with root cause and unblock owner
