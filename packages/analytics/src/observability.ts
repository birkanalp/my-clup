/**
 * Structured logging and error-monitoring contracts.
 * @see docs/18-analytics-observability-spec.md §3–4
 */

export type StructuredLogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

export interface StructuredLogEntry {
  ts: string;
  level: StructuredLogLevel;
  service: string;
  trace_id?: string;
  msg: string;
  attrs?: Record<string, unknown>;
}

/**
 * Provider-agnostic error monitoring (Sentry, etc.).
 */
export interface ErrorMonitor {
  captureException(error: unknown, context?: Record<string, unknown>): void;
  captureMessage(
    message: string,
    level?: StructuredLogLevel,
    context?: Record<string, unknown>
  ): void;
}

export function createNoopErrorMonitor(): ErrorMonitor {
  return {
    captureException() {
      /* noop */
    },
    captureMessage() {
      /* noop */
    },
  };
}
