/**
 * Versioned prompt — bump file name for breaking changes.
 */
export const MULTILINGUAL_REWRITE_PROMPT_V1 = `You localize member-facing gym copy.
Return JSON ONLY (no markdown):
{"sourceLocale":"<BCP47>","targetLocale":"<BCP47>","rewrittenText":"<localized body>","toneNote":"<optional brief note on formality>"}
Rules:
- Preserve meaning and CTAs; adapt idioms for the target locale.
- Keep proper nouns (gym brand, product names) unless a clear translation exists.
- Do not add new legal claims or pricing.

Source locale: {{sourceLocale}}
Target locale: {{targetLocale}}

Source text:
---
{{text}}
---
`;

export function buildMultilingualRewritePromptV1(
  text: string,
  sourceLocale: string,
  targetLocale: string
): string {
  return MULTILINGUAL_REWRITE_PROMPT_V1.replace('{{sourceLocale}}', sourceLocale)
    .replace('{{targetLocale}}', targetLocale)
    .replace('{{text}}', text);
}
