import type { z } from 'zod';
import { parseApiError, ApiError } from './errors';

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
   * Default `Accept-Language` when a request does not pass an explicit `locale`
   * in {@link RequestOptions}.
   */
  defaultLocale?: string;
  /**
   * Optional async function that returns auth headers for each request.
   * Use this for dynamic token injection (Supabase session on web, access_token on mobile).
   */
  getAuthHeaders?: () => Promise<Record<string, string>> | Record<string, string>;
  /** Custom fetch implementation (for testing or custom behavior). */
  fetch?: typeof fetch;
};

/** Options for contract-based requests (path param substitution, query params). */
export type RequestOptions = {
  /** Substitute :paramName in contract.path with pathParams.paramName. */
  pathParams?: Record<string, string>;
  /** Append as query string for GET (e.g. { gymId: "xxx", locale: "tr" }). */
  queryParams?: Record<string, string | number | boolean | undefined>;
  /** Overrides {@link ApiClientConfig.defaultLocale} for this request's `Accept-Language`. */
  locale?: string;
};

export { ApiError };

/**
 * Creates an API client with configurable base URL and optional auth headers.
 * All BFF calls from web and mobile apps should go through this client.
 */
export function createApiClient(config: ApiClientConfig) {
  const baseUrl = config.baseUrl.replace(/\/$/, '');
  const staticHeaders = config.headers ?? {};
  const doFetch = config.fetch ?? fetch;

  async function buildHeaders(localeOverride?: string): Promise<Record<string, string>> {
    const authHeaders = config.getAuthHeaders ? await config.getAuthHeaders() : {};
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...staticHeaders,
      ...authHeaders,
    };
    const locale = localeOverride ?? config.defaultLocale;
    if (locale) {
      headers['Accept-Language'] = locale;
    }
    return headers;
  }

  /**
   * Performs a contract-based request. Fetches the endpoint, parses the response
   * with contract.response.parse(), and returns the typed result.
   */
  async function request<T>(
    contract: ApiContract<unknown, T>,
    requestData?: unknown,
    options?: RequestOptions
  ): Promise<T> {
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

    const headers = await buildHeaders(options?.locale);
    const init: RequestInit = {
      method: contract.method,
      headers,
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
        if (query) url += `${url.includes('?') ? '&' : '?'}${query}`;
      } else {
        init.body = JSON.stringify(requestData);
      }
    }

    const res = await doFetch(url, init);

    if (!res.ok) {
      throw await parseApiError(res);
    }

    const json = await res.json();
    return contract.response.parse(json) as T;
  }

  type MethodInit = Omit<RequestInit, 'headers' | 'method'> & { locale?: string };

  async function get<T>(path: string, init?: MethodInit): Promise<T> {
    const { locale, ...rest } = init ?? {};
    const headers = await buildHeaders(locale);
    const res = await doFetch(`${baseUrl}${path}`, { ...rest, method: 'GET', headers });
    if (!res.ok) throw await parseApiError(res);
    return res.json() as Promise<T>;
  }

  async function post<T>(path: string, body?: unknown, init?: MethodInit): Promise<T> {
    const { locale, ...rest } = init ?? {};
    const headers = await buildHeaders(locale);
    const res = await doFetch(`${baseUrl}${path}`, {
      ...rest,
      method: 'POST',
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) throw await parseApiError(res);
    return res.json() as Promise<T>;
  }

  async function put<T>(path: string, body?: unknown, init?: MethodInit): Promise<T> {
    const { locale, ...rest } = init ?? {};
    const headers = await buildHeaders(locale);
    const res = await doFetch(`${baseUrl}${path}`, {
      ...rest,
      method: 'PUT',
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) throw await parseApiError(res);
    return res.json() as Promise<T>;
  }

  async function patch<T>(path: string, body?: unknown, init?: MethodInit): Promise<T> {
    const { locale, ...rest } = init ?? {};
    const headers = await buildHeaders(locale);
    const res = await doFetch(`${baseUrl}${path}`, {
      ...rest,
      method: 'PATCH',
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) throw await parseApiError(res);
    return res.json() as Promise<T>;
  }

  async function del<T>(path: string, init?: MethodInit): Promise<T> {
    const { locale, ...rest } = init ?? {};
    const headers = await buildHeaders(locale);
    const res = await doFetch(`${baseUrl}${path}`, {
      ...rest,
      method: 'DELETE',
      headers,
    });
    if (!res.ok) throw await parseApiError(res);
    return res.json() as Promise<T>;
  }

  return { request, get, post, put, patch, delete: del };
}
