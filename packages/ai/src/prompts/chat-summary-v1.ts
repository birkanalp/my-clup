/**
 * Versioned prompt — bump file name for breaking changes.
 */
export const CHAT_SUMMARY_PROMPT_V1 = `You are summarizing a gym support or staff chat for handoff.
Return JSON ONLY (no markdown) with this shape:
{"locale":"<BCP47>","summary":"<concise narrative>","topics":["..."],"openQuestions":["optional"],"suggestedStaffReplies":["optional short reply drafts"]}
Rules:
- Output language must match the requested locale.
- Do not invent facts; if transcript is thin, say so in summary.
- Strip or redact emails/phone numbers if present; refer to them as [redacted].
- Max 5 suggested staff replies; each under 240 characters.

Requested output locale: {{locale}}

Transcript (chronological lines, speaker: text):
---
{{transcript}}
---
`;

export function buildChatSummaryPromptV1(transcript: string, locale: string): string {
  return CHAT_SUMMARY_PROMPT_V1.replace('{{locale}}', locale).replace('{{transcript}}', transcript);
}
