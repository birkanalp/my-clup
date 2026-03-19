---
name: doc-context-analyzer
description: Extract implementation context from MyClup documentation before coding begins. Outputs structured markdown and never proposes implementation.
---

# Doc Context Analyzer

## Purpose

Extract implementation context from MyClup documentation before coding begins. Produce structured analysis only. Do **not** propose implementation.

## Workflow

### Step 1: Read Source Documents

Read these documents in precedence order:

| Doc                           | Scope                                         |
| ----------------------------- | --------------------------------------------- |
| `docs/07-technical-plan.md`   | Architecture, stack, boundaries               |
| `AGENT.md`                    | Engineering defaults                          |
| `docs/08-agentic-workflow.md` | Workflow, lifecycle, review and release gates |
| `docs/00-master-plan.md`      | Product vision, roadmap                       |
| `docs/01` through `docs/06`   | Surface-specific scope                        |

### Step 2: Extract Context

Identify:

- affected apps
- affected packages
- architectural constraints
- security and tenant constraints
- localization implications
- chat implications if relevant
- AI implications if relevant
- required tests

### Step 3: Produce Output

Emit structured markdown with:

- task summary
- affected apps
- affected packages
- relevant doc references
- architectural constraints
- risks
- required tests

## Rules

- Never propose implementation
- Cite doc and section when stating constraints
- Apply this decision order for conflicts: `docs/07-technical-plan.md` → `AGENT.md` → `docs/08-agentic-workflow.md` → `docs/00-master-plan.md` → product-specific docs
- If scope is unclear or a required doc is missing, state the gap explicitly
