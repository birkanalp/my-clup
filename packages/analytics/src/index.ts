export { ANALYTICS_SCHEMA_VERSION, type AnalyticsContext, type AnalyticsSurface } from './context';
export { McGa4Event, type McGa4EventName } from './taxonomy';
export { assertValidGa4EventName, logicalEventToGa4Name } from './ga4';
export {
  type AnalyticsEmitter,
  type AnalyticsTrackParams,
  createConsoleAnalyticsEmitter,
  createNoopAnalyticsEmitter,
} from './emitter';
export {
  type ErrorMonitor,
  type StructuredLogEntry,
  type StructuredLogLevel,
  createNoopErrorMonitor,
} from './observability';
