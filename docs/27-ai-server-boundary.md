# AI Server Boundary — Implementation Notes

Authoritative product rules remain in `docs/07-technical-plan.md` §8 and `.cursor/rules/ai-server-only-and-schema-validated.mdc`.

## Package

- **`packages/ai`** (`@myclup/ai`) is the **shared server-side** boundary for Ollama calls.
- **Do not** import `@myclup/ai` from Expo client bundles for runtime execution; call it from Next.js BFF routes or other trusted server code only.

## Configuration

| Variable                | Purpose                                                     |
| ----------------------- | ----------------------------------------------------------- |
| `MYCLUP_AI_ENABLED`     | Set `0` or `false` to disable all calls (safe kill switch). |
| `OLLAMA_HOST`           | Base URL, default `http://127.0.0.1:11434`.                 |
| `MYCLUP_AI_MODEL`       | Model name passed to Ollama.                                |
| `MYCLUP_AI_TIMEOUT_MS`  | Per-request timeout.                                        |
| `MYCLUP_AI_MAX_RETRIES` | Network retries (not schema retries).                       |

## Slices

| Slice                  | Entry                        | Output schema                           |
| ---------------------- | ---------------------------- | --------------------------------------- |
| Workout cleanup        | `runWorkoutCleanup`          | `WorkoutCleanupOutputSchema` (Zod)      |
| Chat summary (handoff) | `runChatConversationSummary` | `ChatConversationSummarySchema` (Zod)   |
| Multilingual rewrite   | `runMultilingualRewrite`     | `MultilingualRewriteOutputSchema` (Zod) |

Prompts are **versioned in code** (`*-v1.ts` files); add new files for new versions.

**Chat summary:** Callers must pass **tenant-safe, policy-compliant** transcripts (PII minimization / redaction before model input).

**Multilingual rewrite:** For **campaign or legal** text, require human review in product workflows before publish (see issue #191).

## Observability

Use `AiLogger` to emit structured lines for success, validation failure, timeout, and disabled flows. Map denial reasons to `docs/18-analytics-observability-spec.md` when wiring product analytics.
