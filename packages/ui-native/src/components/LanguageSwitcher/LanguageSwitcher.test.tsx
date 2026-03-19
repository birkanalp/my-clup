/**
 * Unit tests for LanguageSwitcher.
 * Smoke test: verifies component exports and structure.
 * Full render test (renders TR/EN, calls changeLanguage on press) requires
 * Jest + @testing-library/react-native per RN ecosystem convention.
 */
import { describe, it, expect, vi } from "vitest";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    i18n: {
      language: "en",
      changeLanguage: vi.fn().mockResolvedValue(undefined),
    },
    t: (key: string) => key,
  }),
}));

vi.mock("react-native", () => ({
  View: () => null,
  Text: () => null,
  Pressable: () => null,
  StyleSheet: { create: (s: Record<string, unknown>) => s },
}));

import { LanguageSwitcher } from "./LanguageSwitcher";

describe("LanguageSwitcher", () => {
  it("exports a function component", () => {
    expect(typeof LanguageSwitcher).toBe("function");
  });

  it("is defined and callable", () => {
    expect(LanguageSwitcher).toBeDefined();
    expect(typeof LanguageSwitcher).toBe("function");
  });
});
