import { describe, expect, it } from 'vitest';
import { buildQuickActions, getConversationTitleKey, getMembershipTone } from './homeDashboard';

describe('home dashboard helpers', () => {
  it('maps membership status into the shell tone system', () => {
    expect(getMembershipTone('active')).toBe('success');
    expect(getMembershipTone('expired')).toBe('danger');
    expect(getMembershipTone('pending')).toBe('warning');
    expect(getMembershipTone('anything-else')).toBe('neutral');
  });

  it('maps conversation types to the translation keys used by the dashboard', () => {
    expect(getConversationTitleKey('support')).toBe('conversation.withGym');
    expect(getConversationTitleKey('instructor')).toBe('conversation.withInstructor');
    expect(getConversationTitleKey('direct')).toBe('conversation.direct');
  });

  it('builds the expected quick actions with booking disabled and renew wired', () => {
    const quickActions = buildQuickActions();
    expect(quickActions).toHaveLength(4);
    expect(quickActions[0]).toMatchObject({
      key: 'bookClass',
      disabled: true,
      labelKey: 'quickActions.bookClass',
      hintKey: 'quickActions.bookClassHint',
    });
    expect(quickActions[1]).toMatchObject({
      key: 'openChat',
      route: '/chat',
    });
    expect(quickActions[3]).toMatchObject({
      key: 'renewMembership',
      route: '/membership/renew',
    });
  });
});
