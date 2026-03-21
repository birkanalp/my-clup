import { describe, expect, it, vi } from 'vitest';
import { runChatConversationSummary, runMultilingualRewrite, runWorkoutCleanup } from './boundary';
import type { AiRuntimeConfig } from './env';

const baseConfig: AiRuntimeConfig = {
  enabled: true,
  ollamaBaseUrl: 'http://localhost:11434',
  model: 'test-model',
  defaultTimeoutMs: 5000,
  maxRetries: 0,
};

describe('runWorkoutCleanup', () => {
  it('returns disabled when feature flag off', async () => {
    const res = await runWorkoutCleanup({
      config: { ...baseConfig, enabled: false },
      rawNotes: 'squat 3x5',
      locale: 'en',
    });
    expect(res).toEqual({
      ok: false,
      reason: 'disabled',
      message: 'AI disabled via MYCLUP_AI_ENABLED',
    });
  });

  it('parses valid JSON from Ollama', async () => {
    const fetchFn = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        response: JSON.stringify({
          locale: 'en',
          exercises: [{ name: 'Back squat', detail: '3x5' }],
        }),
      }),
    });

    const res = await runWorkoutCleanup({
      config: baseConfig,
      rawNotes: 'squat',
      locale: 'en',
      fetchFn: fetchFn as unknown as typeof fetch,
    });

    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.value.exercises[0]?.name).toBe('Back squat');
    }
    expect(fetchFn).toHaveBeenCalled();
  });

  it('maps invalid JSON to invalid_json', async () => {
    const fetchFn = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ response: 'not-json' }),
    });

    const res = await runWorkoutCleanup({
      config: baseConfig,
      rawNotes: 'x',
      locale: 'en',
      fetchFn: fetchFn as unknown as typeof fetch,
    });

    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.reason).toBe('invalid_json');
    }
  });
});

describe('runChatConversationSummary', () => {
  it('parses valid summary JSON', async () => {
    const fetchFn = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        response: JSON.stringify({
          locale: 'en',
          summary: 'Member asked about freeze policy.',
          topics: ['membership', 'freeze'],
          openQuestions: ['Effective date?'],
          suggestedStaffReplies: ['I can check your contract end date.'],
        }),
      }),
    });

    const res = await runChatConversationSummary({
      config: baseConfig,
      transcript: 'member: can I freeze?\nstaff: let me check',
      locale: 'en',
      fetchFn: fetchFn as unknown as typeof fetch,
    });

    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.value.summary).toContain('freeze');
      expect(res.value.topics).toContain('membership');
    }
  });
});

describe('runMultilingualRewrite', () => {
  it('parses valid rewrite JSON', async () => {
    const fetchFn = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        response: JSON.stringify({
          sourceLocale: 'en',
          targetLocale: 'tr',
          rewrittenText: 'Ders rezervasyonunuz onaylandı.',
          toneNote: 'Formal TR',
        }),
      }),
    });

    const res = await runMultilingualRewrite({
      config: baseConfig,
      text: 'Your class booking is confirmed.',
      sourceLocale: 'en',
      targetLocale: 'tr',
      fetchFn: fetchFn as unknown as typeof fetch,
    });

    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.value.targetLocale).toBe('tr');
      expect(res.value.rewrittenText.length).toBeGreaterThan(0);
    }
  });
});
