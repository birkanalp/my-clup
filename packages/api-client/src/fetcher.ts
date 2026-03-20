import { parseApiError } from './errors';

export type FetcherOptions = RequestInit & {
  /** Sets `Accept-Language` when provided */
  locale?: string;
};

/**
 * Low-level JSON fetch helper: default `Content-Type: application/json`,
 * optional `Accept-Language`, throws {@link ApiError} from {@link parseApiError} on non-2xx.
 */
export async function fetcher<T>(
  url: string,
  options: FetcherOptions = {},
  fetchImpl: typeof fetch = fetch
): Promise<T> {
  const { locale, headers, ...rest } = options;
  const merged = new Headers(headers);

  if (!merged.has('Content-Type')) {
    merged.set('Content-Type', 'application/json');
  }
  if (locale) {
    merged.set('Accept-Language', locale);
  }

  const res = await fetchImpl(url, {
    ...rest,
    headers: merged,
  });

  if (!res.ok) {
    throw await parseApiError(res);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return res.json() as Promise<T>;
}
