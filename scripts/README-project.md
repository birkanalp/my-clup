# GitHub Project Script

This directory contains an optional bootstrap helper for creating the `MyClup Development` GitHub Project.

The canonical project structure lives in:

- `docs/github-project-setup.md`

Use the script only when you intentionally need to bootstrap or repair the GitHub Project configuration.

## Prerequisites

1. `gh` is installed and authenticated
2. the token has `project` scope

```bash
gh auth refresh -s project -h github.com
```

## Run

```bash
./scripts/setup-github-project.sh
```

Optional arguments:

- `owner`: defaults to `@me`
- `repo`: defaults to `birkanalp/my-clup`
