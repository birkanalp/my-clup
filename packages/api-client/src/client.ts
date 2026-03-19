import type { z } from 'zod';

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
  /** Optional static headers to inject. Applied to every request. */
  headers?: Record<string, string>;
  /**
   * Optional async function that returns auth headers for each request.
   * Use this for dynamic token injection (Supabase session on web, access_token on mobile).
   *
   * Web example:
   *   getAuthHeaders: async () => {
   *     const { data } = await supabase.auth.getSession();
   *     const token = data.session?.access_token;
   *     return token ? { Authorization: `Bearer ${token}` } : {};
   *   }
   *
   * Mobile example:
   *   getAuthHeaders: async () => {
   *     const session = await getLocalSession();
   *     return session?.access_token
   *       ? { Authorization: `Bearer ${session.access_token}` }
   *       : {};
   *   }
   */
  getAuthHeaders?: () => Promise<Record<string, string>> | Record<string, string>;
  /** Custom fetch implementation (for testing or custom behavior). */
  fetch?: typeof fetch;
};

/** Options for contract-based requests (path param substitution, etc.). */
export type RequestOptions = {
  /** Substitute :paramName in contract.path with pathParams.paramName. */
  pathParams?: Record<string, string>;
};

/** Thrown when the API returns a non-2xx status or response fails validation. */
export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
    public readonly body?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Creates an API client with configurable base URL and optional auth headers.
 * All BFF calls from web and mobile apps should go through this client.
 */
export function createApiClient(config: ApiClientConfig) {
  const baseUrl = config.baseUrl.replace(/\/$/, '');
  const staticHeaders = config.headers ?? {};
  const doFetch = config.fetch ?? fetch;

  /**
   * Performs a contract-based request. Fetches the endpoint, parses the response
   * with contract.response.parse(), and returns the typed result.
   *
   * When getAuthHeaders is configured, it is called before each request and its
   * result is merged with static headers (auth headers take precedence).
   *
   * Path params: Pass options.pathParams to substitute :paramName in the path
   * (e.g. pathParams: { id: "uuid" } for /api/v1/chat/conversations/:id).
   *
   * GET requests: When requestData is a plain object, it is serialized as
   * query string (e.g. { cursor: "x", limit: 20 } -> ?cursor=x&limit=20).
   */
  async function request<T>(
    contract: ApiContract<unknown, T>,
    requestData?: unknown,
    options?: RequestOptions
  ): Promise<T> {
    const authHeaders = config.getAuthHeaders ? await config.getAuthHeaders() : {};
    let path = contract.path;
    if (options?.pathParams) {
      for (const [key, value] of Object.entries(options.pathParams)) {
        path = path.replace(`:${key}`, encodeURIComponent(value));
      }
    }
    let url = `${baseUrl}${path}`;
    const init: RequestInit = {
      method: contract.method,
      headers: { 'Content-Type': 'application/json', ...staticHeaders, ...authHeaders },
    };

    if (requestData !== undefined) {
      if (contract.method === 'GET') {
        const params = new URLSearchParams();
        const obj = requestData as Record<string, unknown>;
        if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
          for (const [k, v] of Object.entries(obj)) {
            if (v !== undefined && v !== null) {
              params.set(k, String(v));
            }
          }
        }
        const query = params.toString();
        if (query) url += `?${query}`;
      } else {
        init.body = JSON.stringify(requestData);
      }
    }

    const res = await doFetch(url, init);

    if (!res.ok) {
      const body = await res.text();
      throw new ApiError(`API request failed: ${res.status} ${res.statusText}`, res.status, body);
    }

    const json = await res.json();
    return contract.response.parse(json) as T;
  }

  return { request };
}
