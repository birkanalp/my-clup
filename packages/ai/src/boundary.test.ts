import { describe, expect, it, vi } from 'vitest';
import { runWorkoutCleanup } from './boundary';
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
