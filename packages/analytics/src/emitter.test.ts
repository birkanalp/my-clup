import { describe, expect, it, vi } from 'vitest';
import { ANALYTICS_SCHEMA_VERSION } from './context';
import { createConsoleAnalyticsEmitter, createNoopAnalyticsEmitter } from './emitter';
import { McGa4Event } from './taxonomy';

describe('createNoopAnalyticsEmitter', () => {
  it('does not throw', () => {
    const emit = createNoopAnalyticsEmitter();
    expect(() =>
      emit.track(McGa4Event.booking_session_view, {
        schema_version: ANALYTICS_SCHEMA_VERSION,
        surface: 'mobile_user',
        locale: 'en',
      })
    ).not.toThrow();
  });
});

describe('createConsoleAnalyticsEmitter', () => {
  it('logs event and params', () => {
    const spy = vi.spyOn(console, 'info').mockImplementation(() => {});
    const emit = createConsoleAnalyticsEmitter();
    emit.track(McGa4Event.auth_login_success, {
      schema_version: ANALYTICS_SCHEMA_VERSION,
      surface: 'web_site',
      locale: 'tr',
    });
    expect(spy).toHaveBeenCalledWith(
      '[myclup:analytics]',
      McGa4Event.auth_login_success,
      expect.objectContaining({ locale: 'tr', surface: 'web_site' })
    );
    spy.mockRestore();
  });
});
