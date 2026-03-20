import { ApiErrorResponseSchema } from '@myclup/contracts';

/**
 * Typed API failure. `code` / `details` are set when the response body matches {@link ApiErrorResponseSchema}.
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
    public readonly code?: string,
    public readonly details?: unknown,
    /** Raw response body (when available) for debugging or non-JSON errors */
    public readonly body?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Parse a failed `Response` into an `ApiError`.
 * Uses `ApiErrorResponseSchema.safeParse` on JSON bodies; falls back to a generic error.
 */
export async function parseApiError(response: Response): Promise<ApiError> {
  const status = response.status;
  const statusText = response.statusText;
  let text = '';
  try {
    text = await response.text();
  } catch {
    return new ApiError(`API request failed: ${status} ${statusText}`, status, 'HTTP_ERROR');
  }

  if (!text.trim()) {
    return new ApiError(statusText || 'Request failed', status, 'HTTP_ERROR', undefined, text);
  }

  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    return new ApiError(
      `API request failed: ${status} ${statusText}`,
      status,
      'HTTP_ERROR',
      undefined,
      text
    );
  }

  const parsed = ApiErrorResponseSchema.safeParse(json);
  if (parsed.success) {
    const { code, message, details } = parsed.data;
    return new ApiError(message, status, code, details, text);
  }

  return new ApiError(
    `API request failed: ${status} ${statusText}`,
    status,
    'UNKNOWN',
    undefined,
    text
  );
}
