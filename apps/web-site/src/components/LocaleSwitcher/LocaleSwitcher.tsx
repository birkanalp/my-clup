"use client";

import React from "react";
import { useLocale } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { SUPPORTED_LOCALES } from "@myclup/i18n";

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
      {children}
    </Link>
  );
}

export function LocaleSwitcher() {
  const locale = useLocale();

  return (
    <nav
      className="flex gap-3"
      role="navigation"
      aria-label="Language selection"
    >
      <ul className="flex list-none gap-2 p-0 m-0">
        {SUPPORTED_LOCALES.map((code) => (
          <li key={code}>
            {code === locale ? (
              <span
                className="cursor-default font-semibold no-underline"
                aria-current="true"
              >
                {code.toUpperCase()}
              </span>
            ) : (
              <LocaleLink locale={code}>
                <span className="text-gray-600 underline hover:text-gray-900">
                  {code.toUpperCase()}
                </span>
              </LocaleLink>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}
