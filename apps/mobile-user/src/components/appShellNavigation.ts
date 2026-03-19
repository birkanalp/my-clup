export type ShellRoute = '/' | '/membership' | '/chat' | '/profile';

export type ShellNavItem = {
  href: ShellRoute;
  icon: string;
  labelKey: 'shell.home' | 'shell.membership' | 'shell.chat' | 'shell.profile';
};

export const shellNavItems: ShellNavItem[] = [
  { href: '/', icon: 'view-dashboard-outline', labelKey: 'shell.home' },
  { href: '/membership', icon: 'credit-card-outline', labelKey: 'shell.membership' },
  { href: '/chat', icon: 'chat-outline', labelKey: 'shell.chat' },
  { href: '/profile', icon: 'account-circle-outline', labelKey: 'shell.profile' },
];

export function isShellRouteActive(pathname: string, href: ShellRoute) {
  if (href === '/') {
    return pathname === '/' || pathname.startsWith('/?');
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}
