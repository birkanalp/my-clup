export type ShellRoute = '/' | '/membership' | '/chat';

export type ShellNavItem = {
  href: ShellRoute;
  icon: string;
  labelKey: 'shell.home' | 'shell.membership' | 'shell.chat';
};

export const shellNavItems: ShellNavItem[] = [
  { href: '/', icon: 'view-dashboard-outline', labelKey: 'shell.home' },
  { href: '/membership', icon: 'credit-card-outline', labelKey: 'shell.membership' },
  { href: '/chat', icon: 'chat-outline', labelKey: 'shell.chat' },
];

export function isShellRouteActive(pathname: string, href: ShellRoute) {
  if (href === '/') {
    return pathname === '/' || pathname.startsWith('/?');
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}
