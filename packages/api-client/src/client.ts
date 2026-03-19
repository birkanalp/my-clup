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

/** Options for path and query param substitution. */
export type RequestOptions = {
  /** Substitute :param in path (e.g. { id: "123" } for /conversations/:id). */
  pathParams?: Record<string, string>;
  /** Append as query string for GET (e.g. { gymId: "xxx", locale: "tr" }). */
  queryParams?: Record<string, string | number | boolean | undefined>;
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
   * Supports pathParams (substitute :param in path) and queryParams (append for GET).
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
    if (options?.queryParams && Object.keys(options.queryParams).length > 0) {
      const search = new URLSearchParams();
      for (const [k, v] of Object.entries(options.queryParams)) {
        if (v !== undefined && v !== null && v !== '') search.set(k, String(v));
      }
      const qs = search.toString();
      if (qs) url += `?${qs}`;
    }
    const init: RequestInit = {
      method: contract.method,
      headers: { 'Content-Type': 'application/json', ...staticHeaders, ...authHeaders },
    };

    if (requestData !== undefined && contract.method !== 'GET') {
      init.body = JSON.stringify(requestData);
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
