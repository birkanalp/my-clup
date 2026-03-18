# GitHub Labels Script

This directory contains optional bootstrap helpers for creating or updating the repository label taxonomy.

The canonical label definitions live in:

- `docs/08-agentic-workflow.md`
- `docs/github-workflow.md`

Use the script only when you intentionally need to bootstrap or repair labels in GitHub.

## Option 1: `gh` CLI

```bash
./scripts/setup-github-labels-gh.sh
```

Pass a repo override if needed:

```bash
./scripts/setup-github-labels-gh.sh owner/repo
```

## Option 2: Python

```bash
GITHUB_TOKEN=$(gh auth token) python3 scripts/setup-github-labels.py
```

Or:

```bash
GITHUB_TOKEN=<token> python3 scripts/setup-github-labels.py owner/repo
```
