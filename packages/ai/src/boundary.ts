import type { ZodType } from 'zod';
import type { AiRuntimeConfig } from './env';
import type { AiLogger } from './logger';
import { ollamaGenerateText } from './ollama';
import { buildChatSummaryPromptV1 } from './prompts/chat-summary-v1';
import { buildMultilingualRewritePromptV1 } from './prompts/multilingual-rewrite-v1';
import { buildWorkoutCleanupPromptV1 } from './prompts/workout-cleanup-v1';
import {
  ChatConversationSummarySchema,
  type ChatConversationSummary,
} from './schemas/chat-summary';
import {
  MultilingualRewriteOutputSchema,
  type MultilingualRewriteOutput,
} from './schemas/multilingual-rewrite';
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

async function runOllamaJsonSlice<T>(opts: {
  config: AiRuntimeConfig;
  prompt: string;
  slice: string;
  schema: ZodType<T>;
  fetchFn?: typeof fetch;
  logger?: AiLogger;
}): Promise<AiResult<T>> {
  if (!opts.config.enabled) {
    opts.logger?.('warn', 'ai.feature_disabled', { slice: opts.slice });
    return { ok: false, reason: 'disabled', message: 'AI disabled via MYCLUP_AI_ENABLED' };
  }

  const gen = await ollamaGenerateText({
    baseUrl: opts.config.ollamaBaseUrl,
    model: opts.config.model,
    prompt: opts.prompt,
    timeoutMs: opts.config.defaultTimeoutMs,
    maxRetries: opts.config.maxRetries,
    fetchFn: opts.fetchFn,
    logger: opts.logger,
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
    opts.logger?.('warn', 'ai.output_invalid_json', { slice: opts.slice });
    return { ok: false, reason: 'invalid_json', message: 'Model output was not valid JSON' };
  }

  const safe = opts.schema.safeParse(parsedJson);
  if (!safe.success) {
    opts.logger?.('warn', 'ai.output_schema_failed', {
      slice: opts.slice,
      issues: safe.error.flatten(),
    });
    return { ok: false, reason: 'schema', message: 'Model JSON failed schema validation' };
  }

  opts.logger?.('info', 'ai.slice_success', { slice: opts.slice });
  return { ok: true, value: safe.data };
}

/**
 * Shared server-side AI boundary — workout text cleanup slice.
 */
export async function runWorkoutCleanup(input: {
  config: AiRuntimeConfig;
  rawNotes: string;
  locale: string;
  fetchFn?: typeof fetch;
  logger?: AiLogger;
}): Promise<AiResult<WorkoutCleanupOutput>> {
  return runOllamaJsonSlice({
    config: input.config,
    prompt: buildWorkoutCleanupPromptV1(input.rawNotes, input.locale),
    slice: 'workout_cleanup',
    schema: WorkoutCleanupOutputSchema,
    fetchFn: input.fetchFn,
    logger: input.logger,
  });
}

/**
 * Summarize a conversation transcript for staff handoff (server-side only).
 */
export async function runChatConversationSummary(input: {
  config: AiRuntimeConfig;
  /** Redacted or truncated transcript; caller must enforce tenant policy. */
  transcript: string;
  locale: string;
  fetchFn?: typeof fetch;
  logger?: AiLogger;
}): Promise<AiResult<ChatConversationSummary>> {
  return runOllamaJsonSlice({
    config: input.config,
    prompt: buildChatSummaryPromptV1(input.transcript, input.locale),
    slice: 'chat_summary',
    schema: ChatConversationSummarySchema,
    fetchFn: input.fetchFn,
    logger: input.logger,
  });
}

/**
 * Rewrite member-facing copy from one locale to another.
 */
export async function runMultilingualRewrite(input: {
  config: AiRuntimeConfig;
  text: string;
  sourceLocale: string;
  targetLocale: string;
  fetchFn?: typeof fetch;
  logger?: AiLogger;
}): Promise<AiResult<MultilingualRewriteOutput>> {
  return runOllamaJsonSlice({
    config: input.config,
    prompt: buildMultilingualRewritePromptV1(input.text, input.sourceLocale, input.targetLocale),
    slice: 'multilingual_rewrite',
    schema: MultilingualRewriteOutputSchema,
    fetchFn: input.fetchFn,
    logger: input.logger,
  });
}
