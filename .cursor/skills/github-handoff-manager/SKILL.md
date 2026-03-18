---
name: github-handoff-manager
description: Prepare structured handoff updates between agents using GitHub Issues and labels. Rejects incomplete handoffs when required evidence is missing.
---

# GitHub Handoff Manager

## Purpose

Given the current issue state and completed work, produce a structured handoff that the next agent can act on. Align with the repository's handoff governance.

## Reject a Handoff If Any of These Are Missing

- scope evidence
- test evidence when tests are required
- acceptance criteria evidence for the current stage

## Output Structure

Emit:

1. a copy-paste ready handoff summary comment
2. label recommendations
3. a blocker note when applicable
4. a next-agent verification checklist

## State Guidance

Use the canonical progression:

- implementation complete → `state:implemented`
- validation complete → `state:tested`
- review complete → `state:reviewed`
- approval recorded → `state:approved`
- integrated → `state:integrated`
- workflow complete → `state:done`
- blocked → `state:blocked`

## Owner Mapping

- `owner:pm` → `owner:architect` or `owner:orchestrator`
- `owner:architect` → implementation owner
- implementation owner → `owner:qa`
- `owner:qa` → `owner:review`
- `owner:review` → `owner:release` or `owner:orchestrator`
- `owner:release` → terminal integration or completion step

## Rules

- Exactly one owner label at a time
- Exactly one lifecycle label at a time
- Do not move to the next owner when the work is blocked
- Use `state:blocked` with an explicit blocker note when work cannot continue
