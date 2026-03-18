import { describe, it, expect } from "vitest";
import { isValidLocale } from "./locale";

describe("isValidLocale", () => {
  it("returns true for supported locales", () => {
    expect(isValidLocale("tr")).toBe(true);
    expect(isValidLocale("en")).toBe(true);
  });

  it("returns false for unsupported locale strings", () => {
    expect(isValidLocale("de")).toBe(false);
    expect(isValidLocale("fr")).toBe(false);
    expect(isValidLocale("tr-TR")).toBe(false);
    expect(isValidLocale("en-US")).toBe(false);
  });

  it("returns false for non-string values", () => {
    expect(isValidLocale(null)).toBe(false);
    expect(isValidLocale(undefined)).toBe(false);
    expect(isValidLocale(123)).toBe(false);
    expect(isValidLocale({})).toBe(false);
  });

  it("narrows type when used as type guard", () => {
    const value: unknown = "tr";
    if (isValidLocale(value)) {
      expect(value).toBe("tr");
      const locale: "tr" | "en" = value;
      expect(locale).toBe("tr");
    }
  });
});
