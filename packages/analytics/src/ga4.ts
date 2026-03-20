const GA4_EVENT_NAME_MAX = 40;
const GA4_EVENT_NAME_RE = /^[a-z][a-z0-9_]{0,39}$/;

/**
 * Validates a GA4 custom event name (mc_ prefix recommended).
 */
export function assertValidGa4EventName(name: string): void {
  if (!GA4_EVENT_NAME_RE.test(name)) {
    throw new Error(
      `Invalid GA4 event name "${name}": must match ${GA4_EVENT_NAME_RE}, max ${GA4_EVENT_NAME_MAX} chars`
    );
  }
}

/**
 * Maps a logical name like `booking.session.view` to `mc_booking_session_view`.
 * Only [a-z0-9.] segments are supported; other characters become underscores.
 */
export function logicalEventToGa4Name(logical: string): string {
  const trimmed = logical.trim().toLowerCase();
  const normalized = trimmed
    .replace(/\./g, '_')
    .replace(/[^a-z0-9_]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
  const withPrefix = normalized.startsWith('mc_') ? normalized : `mc_${normalized}`;
  assertValidGa4EventName(withPrefix);
  return withPrefix;
}
