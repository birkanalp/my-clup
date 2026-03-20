import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { routing } from '@/i18n/routing';

function getBaseUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? 'https://myclup.com';
}

type BuildArgs = {
  locale: string;
  pathSuffix: string;
  titleKey: string;
  descriptionKey: string;
};

/**
 * Locale-aware canonical + hreflang alternates for public marketing pages.
 */
export async function buildPublicMetadata({
  locale,
  pathSuffix,
  titleKey,
  descriptionKey,
}: BuildArgs): Promise<Metadata> {
  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    return {};
  }

  const t = await getTranslations({ locale, namespace: 'common' });
  const baseUrl = getBaseUrl();
  const canonicalPath = `/${locale}${pathSuffix}`;
  const canonicalUrl = `${baseUrl}${canonicalPath}`;

  const alternateLanguages: Record<string, string> = {};
  for (const loc of routing.locales) {
    alternateLanguages[loc] = `${baseUrl}/${loc}${pathSuffix}`;
  }

  return {
    title: t(titleKey),
    description: t(descriptionKey),
    alternates: {
      canonical: canonicalUrl,
      languages: {
        'x-default': `${baseUrl}/${routing.defaultLocale}${pathSuffix}`,
        ...alternateLanguages,
      },
    },
  };
}
