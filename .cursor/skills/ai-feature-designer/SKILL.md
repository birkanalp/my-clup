---
name: ai-feature-designer
description: Design AI-backed features compatible with server-side AI architecture. Use when adding AI workflows. Outputs prompt template, output schema, error handling, logging, localization, feature flag. Default runtime Ollama; Qwen small instruct model via env config.
---

# AI Feature Designer

## Purpose

Design AI-backed features compatible with the server-side AI architecture. **All AI logic must run server-side.** No client may call Ollama. Use the shared server-side service boundary. Default runtime: Ollama. Default model: small Qwen instruct model, version selected via environment configuration.

## Core Requirements

- **Server-side only**: All AI calls through the shared service boundary
- **Schema-validated outputs**: Zod schemas; never use raw AI output without validation
- **Timeouts**: Required for every AI call
- **Retry policies**: Required
- **Feature flag**: Must exist to disable AI safely
- **Locale**: Explicit input/output locale for user-facing text
- **Prompt templates**: Versioned in code; not stored long-term without justification

## Output Template

Emit this structure for each AI feature:

```markdown
# AI Feature Design: [Feature Name]

## Prompt Template

\`\`\`
[Versioned prompt with placeholders]
Example: "Given the following workout text: {{input}}\n\nFormat as structured exercises. Output locale: {{locale}}."
\`\`\`

- **Version**: [v1 or semantic]
- **Placeholders**: [input, locale, ...]
- **Prompt storage**: Code (versioned); no long-term storage of raw prompts

## Output Schema

\`\`\`typescript
import { z } from 'zod';

export const [Feature]OutputSchema = z.object({
  // ... validated structure
});
export type [Feature]Output = z.infer<typeof [Feature]OutputSchema>;
\`\`\`

- **Validation**: All AI response must pass through schema before use
- **Fallback shape**: Define safe default if validation fails

## Error Handling Strategy

- **Timeout**: [ms] — throw/catch, return fallback or error response
- **Retry**: [policy] — max attempts, backoff
- **Parse failure**: Zod throws → catch, log, return fallback or user-facing error
- **Ollama unreachable**: Fallback behavior (e.g., return input unchanged, empty structure, or graceful degradation)
- **Feature disabled**: Skip AI call; use fallback path immediately

## Logging Strategy

- **Request**: Log feature name, trace id, locale, input hash (not raw sensitive input)
- **Response**: Log success/failure, latency, validation status
- **Fallback**: Log when fallback is used and reason
- **Avoid**: Logging full raw prompts or user PII in plain text

## Localization Handling

- **Input locale**: Pass to prompt when user-facing input; affects instructions
- **Output locale**: Specify expected output language in prompt; validate localized structure if applicable
- **Fallback messages**: Use translation keys; respect user locale for error messages
- **Schema**: If output contains user-facing text, schema should accommodate locale variants

## Feature Flag Considerations

- **Flag name**: [e.g., AI_[FEATURE]_ENABLED]
- **Default**: [enabled/disabled]
- **Behavior when disabled**: [Fallback path — e.g., no-op, return input, show "unavailable"]
- **Kill switch**: Must allow disabling without deploy
```

## Rules

- **Server-side only**: No client calls to Ollama
- **Single service boundary**: Use the approved shared AI service; do not introduce a second
- **Zod validation**: Every AI output must be validated before use
- **Timeouts and retries**: Non-negotiable
- **Feature flag**: Every AI feature must have a disable path
- **Locale**: User-facing AI text requires explicit locale input and output handling
- **Sensitive prompts**: Do not store long-term without strong justification
- **Fallback**: Define safe behavior when AI fails, times out, or is disabled
