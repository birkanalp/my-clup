import { describe, it, expect } from "vitest";
import {
  LocaleRequestSchema,
  LocaleQueryParamSchema,
  type LocalizedContent,
  type PartialLocalizedContent,
} from "./index";

describe("locale contracts", () => {
  describe("LocaleRequestSchema", () => {
    it("validates locale and optional fallbackLocale", () => {
      expect(LocaleRequestSchema.parse({ locale: "en" })).toEqual({ locale: "en" });
      expect(LocaleRequestSchema.parse({ locale: "tr", fallbackLocale: "en" })).toEqual({
        locale: "tr",
        fallbackLocale: "en",
      });
    });

    it("rejects invalid locale", () => {
      const result = LocaleRequestSchema.safeParse({ locale: "fr" });
      expect(result.success).toBe(false);
    });

    it("rejects invalid fallbackLocale", () => {
      const result = LocaleRequestSchema.safeParse({
        locale: "en",
        fallbackLocale: "de",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("LocaleQueryParamSchema", () => {
    it("accepts empty object (locale optional)", () => {
      expect(LocaleQueryParamSchema.parse({})).toEqual({});
    });

    it("validates locale when provided", () => {
      expect(LocaleQueryParamSchema.parse({ locale: "tr" })).toEqual({ locale: "tr" });
      expect(LocaleQueryParamSchema.parse({ locale: "en" })).toEqual({ locale: "en" });
    });

    it("rejects invalid locale", () => {
      const result = LocaleQueryParamSchema.safeParse({ locale: "invalid" });
      expect(result.success).toBe(false);
    });
  });

  describe("LocalizedContent type", () => {
    it("requires all supported locales", () => {
      const content: LocalizedContent<string> = {
        tr: "Merhaba",
        en: "Hello",
      };
      expect(content.tr).toBe("Merhaba");
      expect(content.en).toBe("Hello");
    });
  });

  describe("PartialLocalizedContent type", () => {
    it("allows partial locale coverage", () => {
      const content: PartialLocalizedContent<string> = {
        en: "Hello",
      };
      expect(content.en).toBe("Hello");
      expect(content.tr).toBeUndefined();
    });
  });
});
