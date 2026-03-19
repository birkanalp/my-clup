import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/lib/i18n.ts');

const nextConfig: NextConfig = {
  transpilePackages: ['@myclup/contracts', '@myclup/ui-web'],
};

export default withNextIntl(nextConfig);
