/**
 * Versioned prompt template — keep edits as new versions (v2, v3).
 */
export const WORKOUT_CLEANUP_PROMPT_V1 = `You are a gym programming assistant.
The trainer provided rough workout notes. Extract distinct exercises as JSON ONLY (no markdown).
Schema:
{"locale":"<BCP47 locale code for member-facing copy>","exercises":[{"name":"string","detail":"optional coaching notes"}]}
Input locale for output: {{locale}}
Rough notes:
---
{{input}}
---
`;

export function buildWorkoutCleanupPromptV1(input: string, locale: string): string {
  return WORKOUT_CLEANUP_PROMPT_V1.replace('{{locale}}', locale).replace('{{input}}', input);
}
