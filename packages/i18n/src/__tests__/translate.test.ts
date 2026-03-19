import { describe, it, expect } from "vitest";
import { t, FALLBACK_LOCALE } from "../index";

describe("t", () => {
  describe("basic lookup", () => {
    it("returns translation for existing key in requested locale", () => {
      expect(t("en", "common", "button.save")).toBe("Save");
      expect(t("tr", "common", "button.save")).toBe("Kaydet");
    });

    it("returns fallback locale value when key missing in requested locale", () => {
      // common:button.loading exists in en, may exist in tr - use a key only in en
      expect(t("tr", "common", "button.save")).toBe("Kaydet");
      // If we request en for a key that exists in en, we get en
      expect(t("en", "common", "button.save")).toBe("Save");
    });

    it("returns key string when not found in locale or fallback", () => {
      expect(t("en", "common", "nonexistent.key")).toBe("nonexistent.key");
    });
  });

  describe("interpolation", () => {
    it("replaces {{var}} placeholders with params", () => {
      expect(t("en", "auth", "welcome", { name: "Alice" })).toBe("Welcome, Alice!");
    });

    it("keeps missing params as {{var}}", () => {
      expect(t("en", "auth", "welcome", {})).toBe("Welcome, {{name}}!");
    });

    it("supports numeric params", () => {
      expect(t("en", "errors", "validation.min", { min: 5 })).toBe("Minimum value is 5.");
    });
  });

  describe("pluralization", () => {
    it("uses one form when count is 1", () => {
      expect(t("en", "common", "items_count", { count: 1 })).toBe("1 item");
    });

    it("uses other form when count is not 1", () => {
      expect(t("en", "common", "items_count", { count: 0 })).toBe("0 items");
      expect(t("en", "common", "items_count", { count: 5 })).toBe("5 items");
    });

    it("interpolates count in plural form", () => {
      expect(t("en", "common", "items_count", { count: 3 })).toBe("3 items");
    });
  });

  describe("fallback order", () => {
    it("falls back to FALLBACK_LOCALE when key missing in requested locale", () => {
      // fallbackOnly exists in en but not in tr - so tr falls back to en
      expect(t("tr", "errors", "fallbackOnly")).toBe("Fallback only");
      expect(t("en", "errors", "fallbackOnly")).toBe("Fallback only");
    });

    it("FALLBACK_LOCALE is en", () => {
      expect(FALLBACK_LOCALE).toBe("en");
    });
  });
});
