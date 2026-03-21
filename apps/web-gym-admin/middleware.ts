import createMiddleware from 'next-intl/middleware';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { routing } from './src/i18n/routing';
import { getSession } from '@myclup/supabase';

const intlMiddleware = createMiddleware(routing);

/**
 * Paths that do not require authentication. These are locale-prefixed paths
 * matched AFTER stripping the locale prefix (i.e. the pathname without the
 * locale segment).
 */
const PUBLIC_PATHS = new Set(['/sign-in', '/dev-login']);

/**
 * Returns the pathname without the leading locale segment.
 * e.g. "/en/members" → "/members", "/tr/sign-in" → "/sign-in"
 *
 * If the pathname has no locale prefix (should not happen with next-intl,
 * but defensive), the original pathname is returned.
 */
function stripLocale(pathname: string, locales: readonly string[]): string {
  for (const locale of locales) {
    const prefix = `/${locale}`;
    if (pathname === prefix || pathname.startsWith(`${prefix}/`)) {
      return pathname.slice(prefix.length) || '/';
    }
  }
  return pathname;
}

export default async function middleware(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;

  // Let next-intl handle locale routing first. This ensures redirects for
  // locale detection and default locale normalization happen as expected.
  const intlResponse = intlMiddleware(request);

  // If next-intl issued a redirect or rewrite, honour it.
  if (intlResponse.status !== 200) {
    return intlResponse;
  }

  // Determine the path without locale prefix for public-path matching.
  const pathWithoutLocale = stripLocale(pathname, routing.locales);

  // Public paths: sign-in, dev-login (dev-login only active in development).
  if (PUBLIC_PATHS.has(pathWithoutLocale)) {
    return intlResponse;
  }

  // Check for a valid session via cookie.
  const session = await getSession(request);

  if (!session) {
    // Determine the locale from the path (for locale-aware redirect).
    let redirectLocale = routing.defaultLocale;
    for (const locale of routing.locales) {
      if (pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`) {
        redirectLocale = locale;
        break;
      }
    }

    const signInUrl = new URL(`/${redirectLocale}/sign-in`, request.url);
    return NextResponse.redirect(signInUrl);
  }

  return intlResponse;
}

export const config = {
  matcher: ['/((?!api|trpc|_next|_vercel|.*\\..*).*)'],
};
