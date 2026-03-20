/**
 * Resolve AI runtime configuration from process environment.
 * Server-side only — never read these from untrusted client input.
 */
export type AiRuntimeConfig = {
  /** When false, all AI entrypoints short-circuit without calling Ollama. */
  enabled: boolean;
  ollamaBaseUrl: string;
  model: string;
  defaultTimeoutMs: number;
  maxRetries: number;
};

function parsePositiveInt(raw: string | undefined, fallback: number): number {
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : fallback;
}

export function resolveAiConfigFromEnv(env: NodeJS.ProcessEnv = process.env): AiRuntimeConfig {
  const disabled = env.MYCLUP_AI_ENABLED === '0' || env.MYCLUP_AI_ENABLED === 'false';
  return {
    enabled: !disabled,
    ollamaBaseUrl: env.OLLAMA_HOST?.replace(/\/$/, '') ?? 'http://127.0.0.1:11434',
    model: env.MYCLUP_AI_MODEL ?? 'qwen2.5:7b-instruct',
    defaultTimeoutMs: parsePositiveInt(env.MYCLUP_AI_TIMEOUT_MS, 30_000),
    maxRetries: Math.min(5, parsePositiveInt(env.MYCLUP_AI_MAX_RETRIES, 2)),
  };
}
