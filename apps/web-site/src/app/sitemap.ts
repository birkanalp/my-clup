import type { MetadataRoute } from 'next';
import { routing } from '@/i18n/routing';

function getBaseUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? 'https://myclup.com';
}

const STATIC_PATHS = ['', '/about', '/contact', '/discover', '/legal/privacy', '/legal/terms'];

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getBaseUrl();
  const entries: MetadataRoute.Sitemap = [];

  for (const locale of routing.locales) {
    for (const suffix of STATIC_PATHS) {
      const path = `/${locale}${suffix}`;
      entries.push({
        url: `${base}${path}`,
        lastModified: new Date(),
      });
    }
  }

  return entries;
}
