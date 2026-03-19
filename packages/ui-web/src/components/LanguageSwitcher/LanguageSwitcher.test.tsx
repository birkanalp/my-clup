import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LanguageSwitcher } from './LanguageSwitcher';

function MockLocaleLink({ locale, children }: { locale: string; children: React.ReactNode }) {
  return (
    <a href={`/${locale}`} data-testid={`locale-link-${locale}`}>
      {children}
    </a>
  );
}

describe('LanguageSwitcher', () => {
  const locales = [
    { code: 'tr', label: 'TR' },
    { code: 'en', label: 'EN' },
  ] as const;

  it('renders both locale options', () => {
    render(<LanguageSwitcher locales={locales} currentLocale="tr" LocaleLink={MockLocaleLink} />);

    expect(screen.getByText('TR')).toBeInTheDocument();
    expect(screen.getByText('EN')).toBeInTheDocument();
  });

  it('applies active state to current locale (tr)', () => {
    render(<LanguageSwitcher locales={locales} currentLocale="tr" LocaleLink={MockLocaleLink} />);

    const trElement = screen.getByText('TR');
    expect(trElement).toHaveAttribute('aria-current', 'true');
    expect(trElement.tagName).toBe('SPAN');
  });

  it('renders link for non-current locale', () => {
    render(<LanguageSwitcher locales={locales} currentLocale="tr" LocaleLink={MockLocaleLink} />);

    const enLink = screen.getByTestId('locale-link-en');
    expect(enLink).toBeInTheDocument();
    expect(enLink).toHaveAttribute('href', '/en');
  });

  it('applies active state when current locale is en', () => {
    render(<LanguageSwitcher locales={locales} currentLocale="en" LocaleLink={MockLocaleLink} />);

    const enElement = screen.getByText('EN');
    expect(enElement).toHaveAttribute('aria-current', 'true');
  });
});
