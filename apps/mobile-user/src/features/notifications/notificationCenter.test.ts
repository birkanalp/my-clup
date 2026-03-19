import { describe, expect, it } from 'vitest';
import { buildNotificationSignals } from './notificationCenter';

describe('notification center helpers', () => {
  it('builds actionable membership and chat signals before placeholders', () => {
    const items = buildNotificationSignals({
      renewalReason: 'expired',
      conversations: [
        {
          id: '11111111-1111-1111-1111-111111111111',
          gymId: '22222222-2222-2222-2222-222222222222',
          branchId: null,
          type: 'support',
          metadata: {},
          createdAt: '2026-03-19T08:00:00.000Z',
          updatedAt: '2026-03-19T09:00:00.000Z',
          unreadCount: 3,
        },
      ],
    });

    expect(items.map((item) => item.key)).toEqual(['membership', 'chat', 'booking', 'updates']);
    expect(items[0]).toMatchObject({
      actionRoute: '/membership/renew',
      actionLabelKey: 'cta.renewNow',
      tone: 'warning',
    });
    expect(items[1]).toMatchObject({
      actionRoute: '/chat',
      actionLabelKey: 'cta.openChat',
      tone: 'primary',
    });
  });

  it('falls back to an all-caught-up signal when no actionable state exists', () => {
    const items = buildNotificationSignals({
      renewalReason: null,
      conversations: [],
    });

    expect(items[0]).toMatchObject({
      key: 'updates',
      titleKey: 'notifications.caughtUpTitle',
      tone: 'success',
    });
    expect(items[1]).toMatchObject({
      key: 'booking',
      tone: 'neutral',
    });
  });
});
