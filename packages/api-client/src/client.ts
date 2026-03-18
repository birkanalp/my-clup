import type { z } from "zod";

/** Contract shape: path, method, optional request schema, response schema. */
export type ApiContract<TRequest = unknown, TResponse = unknown> = {
  path: string;
  method: string;
  request?: z.ZodType<TRequest>;
  response: z.ZodType<TResponse>;
};

/** Configuration for the API client. */
export type ApiClientConfig = {
  /** Base URL for all requests (e.g. https://api.example.com). Trailing slash is normalized. */
  baseUrl: string;
  /** Optional headers to inject (e.g. Authorization). Applied to every request. */
  headers?: Record<string, string>;
  /** Custom fetch implementation (for testing or custom behavior). */
  fetch?: typeof fetch;
};

/** Thrown when the API returns a non-2xx status or response fails validation. */
export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
    public readonly body?: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * Creates an API client with configurable base URL and optional auth headers.
 * All BFF calls from web and mobile apps should go through this client.
 */
export function createApiClient(config: ApiClientConfig) {
  const baseUrl = config.baseUrl.replace(/\/$/, "");
  const headers = config.headers ?? {};
  const doFetch = config.fetch ?? fetch;

  /**
   * Performs a contract-based request. Fetches the endpoint, parses the response
   * with contract.response.parse(), and returns the typed result.
   */
  async function request<T>(
    contract: ApiContract<unknown, T>,
    requestData?: unknown
  ): Promise<T> {
    const url = `${baseUrl}${contract.path}`;
    const init: RequestInit = {
      method: contract.method,
      headers: { "Content-Type": "application/json", ...headers },
    };

    if (requestData !== undefined && contract.method !== "GET") {
      init.body = JSON.stringify(requestData);
    }

    const res = await doFetch(url, init);

    if (!res.ok) {
      const body = await res.text();
      throw new ApiError(
        `API request failed: ${res.status} ${res.statusText}`,
        res.status,
        body
      );
    }

    const json = await res.json();
    return contract.response.parse(json) as T;
  }

  return { request };
}
