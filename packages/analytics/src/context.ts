/**
 * Surfaces that emit product analytics. Must stay aligned with
 * `docs/18-analytics-observability-spec.md`.
 */
export type AnalyticsSurface =
  | 'web_gym_admin'
  | 'web_platform_admin'
  | 'web_site'
  | 'mobile_user'
  | 'mobile_admin';

/** Bump when `AnalyticsContext` shape changes in a breaking way. */
export const ANALYTICS_SCHEMA_VERSION = 1;

/**
 * Required context for every analytics event (plus event-specific params).
 */
export interface AnalyticsContext {
  schema_version: number;
  surface: AnalyticsSurface;
  /** BCP-47 language tag (e.g. en, tr). Use `und` if unknown. */
  locale: string;
  gym_id?: string;
  branch_id?: string;
  session_id?: string;
}
