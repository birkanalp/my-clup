/**
 * @myclup/api-client — Shared typed API client for all product surfaces.
 *
 * Web and mobile apps must use this package for BFF calls. No app may introduce
 * a second network client.
 */
export { createApiClient, ApiError, type ApiClientConfig, type ApiContract } from './client';
export { createHealthApi } from './health';
export type { PingResponse } from '@myclup/contracts/health';

import { createApiClient } from './client';
import { createHealthApi } from './health';
import type { ApiClientConfig } from './client';

/**
 * Creates the full API surface with base URL and optional headers.
 * Use this in web and mobile apps to get typed domain methods.
 *
 * @example
 * const api = createApi({ baseUrl: "https://api.example.com" });
 * const result = await api.health.ping();
 */
export function createApi(config: ApiClientConfig) {
  const client = createApiClient(config);
  return {
    health: createHealthApi(client.request),
  };
}
