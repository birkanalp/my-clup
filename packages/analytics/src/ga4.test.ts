import { describe, expect, it } from 'vitest';
import { assertValidGa4EventName, logicalEventToGa4Name } from './ga4';

describe('logicalEventToGa4Name', () => {
  it('maps dot notation to mc_ snake_case', () => {
    expect(logicalEventToGa4Name('booking.session.view')).toBe('mc_booking_session_view');
  });

  it('preserves existing mc_ prefix', () => {
    expect(logicalEventToGa4Name('mc_auth_login_success')).toBe('mc_auth_login_success');
  });

  it('rejects names over 40 chars', () => {
    expect(() => logicalEventToGa4Name('a'.repeat(50))).toThrow(/Invalid GA4 event name/);
  });
});

describe('assertValidGa4EventName', () => {
  it('accepts valid names', () => {
    expect(() => assertValidGa4EventName('mc_foo_bar')).not.toThrow();
  });

  it('rejects uppercase', () => {
    expect(() => assertValidGa4EventName('Mc_foo')).toThrow();
  });
});
