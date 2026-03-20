/**
 * Canonical GA4 wire names (snake_case, mc_ prefix, ≤40 chars).
 * Add new events here and document in `docs/18-analytics-observability-spec.md`.
 */
export const McGa4Event = {
  auth_login_success: 'mc_auth_login_success',
  auth_logout: 'mc_auth_logout',
  booking_session_view: 'mc_booking_session_view',
  booking_session_book: 'mc_booking_session_book',
  booking_session_cancel: 'mc_booking_session_cancel',
  chat_thread_open: 'mc_chat_thread_open',
  chat_message_send: 'mc_chat_message_send',
  membership_plan_view: 'mc_membership_plan_view',
  discovery_search: 'mc_discovery_search',
  progress_workout_log: 'mc_progress_workout_log',
  screen_view: 'mc_screen_view',
} as const;

export type McGa4EventName = (typeof McGa4Event)[keyof typeof McGa4Event];
