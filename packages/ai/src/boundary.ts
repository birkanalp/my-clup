import type { AiRuntimeConfig } from './env';
import type { AiLogger } from './logger';
import { ollamaGenerateText } from './ollama';
import { buildWorkoutCleanupPromptV1 } from './prompts/workout-cleanup-v1';
import { WorkoutCleanupOutputSchema, type WorkoutCleanupOutput } from './schemas/workout-cleanup';

export type AiFailureReason =
  | 'disabled'
  | 'ollama_http'
  | 'ollama_timeout'
  | 'ollama_network'
  | 'ollama_empty_response'
  | 'invalid_json'
  | 'schema'
  | 'unknown';

export type AiResult<T> =
  | { ok: true; value: T }
  | { ok: false; reason: AiFailureReason; message: string };

function mapOllamaReason(r: string): AiFailureReason {
  if (r === 'ollama_timeout') return 'ollama_timeout';
  if (r.startsWith('ollama_http')) return 'ollama_http';
  if (r === 'ollama_empty_response') return 'ollama_empty_response';
  if (r.startsWith('ollama_')) return 'ollama_network';
  return 'unknown';
}

/**
 * Shared server-side AI boundary — workout text cleanup slice (initial use case).
 */
export async function runWorkoutCleanup(input: {
  config: AiRuntimeConfig;
  rawNotes: string;
  locale: string;
  fetchFn?: typeof fetch;
  logger?: AiLogger;
}): Promise<AiResult<WorkoutCleanupOutput>> {
  if (!input.config.enabled) {
    input.logger?.('warn', 'ai.feature_disabled', { slice: 'workout_cleanup' });
    return { ok: false, reason: 'disabled', message: 'AI disabled via MYCLUP_AI_ENABLED' };
  }

  const prompt = buildWorkoutCleanupPromptV1(input.rawNotes, input.locale);
  const gen = await ollamaGenerateText({
    baseUrl: input.config.ollamaBaseUrl,
    model: input.config.model,
    prompt,
    timeoutMs: input.config.defaultTimeoutMs,
    maxRetries: input.config.maxRetries,
    fetchFn: input.fetchFn,
    logger: input.logger,
  });

  if (!gen.ok) {
    return {
      ok: false,
      reason: mapOllamaReason(gen.reason),
      message: gen.reason,
    };
  }

  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(gen.text) as unknown;
  } catch {
    input.logger?.('warn', 'ai.output_invalid_json', { slice: 'workout_cleanup' });
    return { ok: false, reason: 'invalid_json', message: 'Model output was not valid JSON' };
  }

  const safe = WorkoutCleanupOutputSchema.safeParse(parsedJson);
  if (!safe.success) {
    input.logger?.('warn', 'ai.output_schema_failed', {
      slice: 'workout_cleanup',
      issues: safe.error.flatten(),
    });
    return { ok: false, reason: 'schema', message: 'Model JSON failed schema validation' };
  }

  input.logger?.('info', 'ai.slice_success', { slice: 'workout_cleanup' });
  return { ok: true, value: safe.data };
}
