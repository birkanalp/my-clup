import { describe, expect, it } from 'vitest';
import { buildNotificationCenterDigest } from './notificationCenter';
import type { MembershipScreenData } from '../membership/types';
import type { ConversationWithUnread } from '../chat/useConversations';

function createMembershipData(overrides: Partial<MembershipScreenData> = {}): MembershipScreenData {
  return {
    locale: 'en',
    memberId: 'member-1',
    membership: null,
    plan: null,
    renewalOptions: [],
    canRenew: false,
    renewalReason: null,
    ...overrides,
  };
}

describe('buildNotificationCenterDigest', () => {
  it('surfaces membership renewal and unread chat as actionable cards', () => {
    const membershipData = createMembershipData({
      membership: {
        id: 'membership-1',
        planId: 'plan-1',
        memberId: 'member-1',
        gymId: 'gym-1',
        branchId: null,
        status: 'active',
        validFrom: '2026-03-01T00:00:00.000Z',
        validUntil: '2026-03-31T00:00:00.000Z',
        remainingSessions: 4,
        freezeStartAt: null,
        freezeEndAt: null,
        entitledBranchIds: [],
        createdAt: '2026-03-01T00:00:00.000Z',
        updatedAt: '2026-03-01T00:00:00.000Z',
      },
      canRenew: true,
      renewalReason: 'expiring_soon',
    });
    const conversations: ConversationWithUnread[] = [
      {
        id: 'conversation-1',
        type: 'support',
        gymId: 'gym-1',
        branchId: null,
        metadata: {},
        unreadCount: 2,
        createdAt: '2026-03-18T10:00:00.000Z',
        updatedAt: '2026-03-19T10:00:00.000Z',
      },
    ];

    const digest = buildNotificationCenterDigest({ membershipData, conversations });

    expect(digest.actionableCount).toBe(2);
    expect(digest.cards[0]).toMatchObject({
      key: 'membership',
      state: 'action',
      route: '/membership/renew',
      renewalReason: 'expiring_soon',
    });
    expect(digest.cards[1]).toMatchObject({
      key: 'chat',
      state: 'action',
      route: '/chat',
      unreadCount: 2,
    });
  });

  it('keeps booking and app cards as placeholders and degrades gracefully with no data', () => {
    const digest = buildNotificationCenterDigest({
      membershipData: createMembershipData(),
      conversations: [],
    });

    expect(digest.actionableCount).toBe(0);
    expect(digest.cards).toEqual([
      { key: 'membership', route: '/membership', state: 'placeholder' },
      { key: 'chat', route: '/chat', state: 'placeholder' },
      { key: 'booking', route: null, state: 'placeholder' },
      { key: 'app', route: null, state: 'placeholder' },
    ]);
  });
});
