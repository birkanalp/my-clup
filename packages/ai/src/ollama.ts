import type { AiLogger } from './logger';

export type OllamaGenerateBody = {
  model: string;
  prompt: string;
  stream: boolean;
};

export type OllamaGenerateResponse = {
  response?: string;
};

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

/**
 * POST /api/generate against Ollama with timeout and limited retries on network failures.
 */
export async function ollamaGenerateText(input: {
  baseUrl: string;
  model: string;
  prompt: string;
  timeoutMs: number;
  maxRetries: number;
  fetchFn?: typeof fetch;
  logger?: AiLogger;
}): Promise<{ ok: true; text: string } | { ok: false; reason: string }> {
  const fetchFn = input.fetchFn ?? fetch;
  const url = `${input.baseUrl}/api/generate`;
  const body: OllamaGenerateBody = {
    model: input.model,
    prompt: input.prompt,
    stream: false,
  };

  let attempt = 0;
  while (attempt <= input.maxRetries) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), input.timeoutMs);
    try {
      const res = await fetchFn(url, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
      clearTimeout(timer);

      if (!res.ok) {
        input.logger?.('warn', 'ai.ollama.http_error', { status: res.status, attempt });
        return { ok: false, reason: `ollama_http_${res.status}` };
      }

      const json = (await res.json()) as OllamaGenerateResponse;
      const text = typeof json.response === 'string' ? json.response : '';
      if (!text.trim()) {
        input.logger?.('warn', 'ai.ollama.empty_response', { attempt });
        return { ok: false, reason: 'ollama_empty_response' };
      }
      return { ok: true, text };
    } catch (err) {
      clearTimeout(timer);
      const aborted = err instanceof Error && err.name === 'AbortError';
      input.logger?.('warn', 'ai.ollama.request_failed', {
        attempt,
        aborted,
        message: err instanceof Error ? err.message : 'unknown',
      });
      if (aborted) {
        return { ok: false, reason: 'ollama_timeout' };
      }
      if (attempt >= input.maxRetries) {
        return { ok: false, reason: 'ollama_network' };
      }
      await sleep(200 * (attempt + 1));
      attempt += 1;
    }
  }
  return { ok: false, reason: 'ollama_exhausted_retries' };
}
