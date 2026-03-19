'use client';

import type { ReactNode } from 'react';

export interface LocaleOption {
  code: string;
  label: string;
}

export interface LocaleLinkProps {
  locale: string;
  children: ReactNode;
}

export interface LanguageSwitcherProps {
  /** Supported locale options (e.g. [{ code: "tr", label: "TR" }, { code: "en", label: "EN" }]) */
  locales: readonly LocaleOption[];
  /** Current active locale code */
  currentLocale: string;
  /** Link component that switches locale; receives locale and children */
  LocaleLink: React.ComponentType<LocaleLinkProps>;
  /** Optional class name for the container */
  className?: string;
}

/**
 * Presentational locale toggle. Renders TR/EN (or configured) options.
 * Triggers locale switch via the provided LocaleLink (typically next-intl Link with locale prop).
 */
export function LanguageSwitcher({
  locales,
  currentLocale,
  LocaleLink,
  className,
}: LanguageSwitcherProps) {
  return (
    <nav className={className} role="navigation" aria-label="Language selection">
      <ul
        style={{
          display: 'flex',
          gap: '0.5rem',
          listStyle: 'none',
          margin: 0,
          padding: 0,
        }}
      >
        {locales.map(({ code, label }) => (
          <li key={code}>
            {code === currentLocale ? (
              <span
                style={{
                  fontWeight: 600,
                  textDecoration: 'none',
                  cursor: 'default',
                }}
                aria-current="true"
              >
                {label}
              </span>
            ) : (
              <LocaleLink locale={code}>{label}</LocaleLink>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}
