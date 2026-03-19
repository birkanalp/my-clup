Design an AI-backed feature compatible with the MyClup server-side AI architecture.

For the feature described by the user, produce a complete AI feature design document with the following sections:

## AI Feature Design: $ARGUMENTS

### Prompt Template

Provide a versioned prompt with all placeholders (input, locale, etc.). Include:

- Version identifier (v1 or semantic)
- All placeholder names and their purpose
- Prompt storage policy (code-versioned; no long-term raw storage)

### Output Schema

Provide a complete Zod schema:

```typescript
import { z } from 'zod';

export const [Feature]OutputSchema = z.object({
  // validated structure
});
export type [Feature]Output = z.infer<typeof [Feature]OutputSchema>;
```

Include a safe fallback shape for when validation fails.

### Error Handling Strategy

- **Timeout**: specify ms; throw/catch → fallback or error response
- **Retry**: max attempts, backoff policy
- **Parse failure**: Zod throws → catch, log, return fallback or user-facing error
- **Ollama unreachable**: fallback behavior (return input unchanged, empty structure, or graceful degradation)
- **Feature disabled**: skip AI call; use fallback path immediately

### Logging Strategy

- **Request**: log feature name, trace id, locale, input hash (not raw sensitive input)
- **Response**: log success/failure, latency, validation status
- **Fallback**: log when fallback is used and why
- **Avoid**: logging full raw prompts or user PII

### Localization Handling

- Input locale: how it's passed to the prompt
- Output locale: how expected output language is specified
- Fallback messages: use translation keys; respect user locale for errors
- Schema locale variants if output contains user-facing text

### Feature Flag

- Flag name: `AI_[FEATURE]_ENABLED`
- Default state: enabled/disabled
- Behavior when disabled: fallback path description
- Kill switch: must work without deploy

### Constraints Checklist

- [ ] AI call goes through shared server-side service boundary (not client-side)
- [ ] Single service boundary — no second AI boundary introduced
- [ ] Zod schema defined and enforced
- [ ] Timeout configured
- [ ] Retry policy configured
- [ ] Feature flag exists
- [ ] Locale explicit for user-facing input/output
- [ ] Sensitive prompts not stored long-term
- [ ] Fallback behavior defined
