import { describe, expect, it } from 'vitest';
import { isShellRouteActive, shellNavItems } from './appShellNavigation';

describe('app shell navigation', () => {
  it('keeps a stable navigation rail for the member shell', () => {
    expect(shellNavItems).toEqual([
      { href: '/', icon: 'view-dashboard-outline', labelKey: 'shell.home' },
      { href: '/membership', icon: 'credit-card-outline', labelKey: 'shell.membership' },
      { href: '/chat', icon: 'chat-outline', labelKey: 'shell.chat' },
    ]);
  });

  it('marks nested shell routes as active for the right tab', () => {
    expect(isShellRouteActive('/', '/')).toBe(true);
    expect(isShellRouteActive('/membership', '/membership')).toBe(true);
    expect(isShellRouteActive('/membership/payments', '/membership')).toBe(true);
    expect(isShellRouteActive('/chat/abc', '/chat')).toBe(true);
    expect(isShellRouteActive('/chat/abc', '/membership')).toBe(false);
  });
});
