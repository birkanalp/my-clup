"use client";

import { useLocale } from "next-intl";
import { Link, usePathname } from "@/src/i18n/navigation";
import { LanguageSwitcher } from "@myclup/ui-web";
import { SUPPORTED_LOCALES } from "@myclup/i18n";

const LOCALE_OPTIONS = SUPPORTED_LOCALES.map((code) => ({
  code,
  label: code.toUpperCase(),
}));

function LocaleLink({
  locale,
  children,
}: {
  locale: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  return (
    <Link href={pathname} locale={locale}>
      {/* Type assertion: React 18/19 ReactNode mismatch in monorepo */}
      {children as React.ReactNode & {}}
    </Link>
  );
}

export function AppLanguageSwitcher() {
  const locale = useLocale();
  return (
    <LanguageSwitcher
      locales={LOCALE_OPTIONS}
      currentLocale={locale}
      LocaleLink={LocaleLink}
    />
  );
}
