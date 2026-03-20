import type { AnalyticsContext } from './context';

export type AnalyticsTrackParams = AnalyticsContext & Record<string, unknown>;

export interface AnalyticsEmitter {
  /**
   * @param eventName - Wire-format GA4 name (e.g. from `McGa4Event`).
   * @param params - Must include full `AnalyticsContext`.
   */
  track(eventName: string, params: AnalyticsTrackParams): void;
}

export function createNoopAnalyticsEmitter(): AnalyticsEmitter {
  return {
    track() {
      /* intentionally empty */
    },
  };
}

export function createConsoleAnalyticsEmitter(): AnalyticsEmitter {
  return {
    track(eventName, params) {
      console.info('[myclup:analytics]', eventName, params);
    },
  };
}
