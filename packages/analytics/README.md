# @myclup/analytics

Shared **product analytics** taxonomy, GA4 wire naming helpers, and **emitter** abstractions for web and mobile.

- Spec: `docs/18-analytics-observability-spec.md`
- Durable **audit** events: `packages/supabase` (`writeAuditEvent`)

## Usage

```ts
import {
  ANALYTICS_SCHEMA_VERSION,
  McGa4Event,
  createNoopAnalyticsEmitter,
  logicalEventToGa4Name,
} from '@myclup/analytics';

const emit = createNoopAnalyticsEmitter();
emit.track(McGa4Event.booking_session_view, {
  schema_version: ANALYTICS_SCHEMA_VERSION,
  surface: 'mobile_user',
  locale: 'en',
});
```
