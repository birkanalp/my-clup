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
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */} {/* React 18/19 types conflict */}
      {children as any}
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
