import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { LocaleSwitcher } from "./LocaleSwitcher";

const mockUseLocale = vi.fn();

vi.mock("next-intl", () => ({
  useLocale: () => mockUseLocale(),
}));

vi.mock("@/i18n/navigation", () => ({
  Link: ({
    locale,
    children,
  }: {
    locale: string;
    children: React.ReactNode;
  }) => (
    <a href={`/${locale}`} data-testid={`locale-link-${locale}`}>
      {children}
    </a>
  ),
  usePathname: () => "/",
}));

describe("LocaleSwitcher", () => {
  beforeEach(() => {
    mockUseLocale.mockReturnValue("tr");
  });

  it("renders TR and EN options", () => {
    render(<LocaleSwitcher />);
    expect(screen.getByText("TR")).toBeInTheDocument();
    expect(screen.getByText("EN")).toBeInTheDocument();
  });

  it("renders link for non-current locale with correct href", () => {
    mockUseLocale.mockReturnValue("tr");
    render(<LocaleSwitcher />);
    const enLink = screen.getByTestId("locale-link-en");
    expect(enLink).toBeInTheDocument();
    expect(enLink).toHaveAttribute("href", "/en");
  });

  it("renders link for tr when current locale is en", () => {
    mockUseLocale.mockReturnValue("en");
    render(<LocaleSwitcher />);
    const trLink = screen.getByTestId("locale-link-tr");
    expect(trLink).toBeInTheDocument();
    expect(trLink).toHaveAttribute("href", "/tr");
  });

  it("marks current locale with aria-current", () => {
    mockUseLocale.mockReturnValue("tr");
    render(<LocaleSwitcher />);
    const trElement = screen.getByText("TR");
    expect(trElement).toHaveAttribute("aria-current", "true");
  });
});
