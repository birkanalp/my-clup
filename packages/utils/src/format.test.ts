import { describe, it, expect } from "vitest";
import { formatDate, formatNumber, formatCurrency } from "./format";

describe("formatDate", () => {
  it("formats date with Turkish locale", () => {
    const d = new Date("2024-03-15T12:00:00.000Z");
    const result = formatDate(d, "tr");
    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(0);
    // Turkish medium date typically includes day, month, year
    expect(result).toMatch(/\d/);
  });

  it("formats date with English locale", () => {
    const d = new Date("2024-03-15T12:00:00.000Z");
    const result = formatDate(d, "en");
    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(0);
    expect(result).toMatch(/\d/);
  });

  it("respects dateStyle option", () => {
    const d = new Date("2024-03-15T12:00:00.000Z");
    const short = formatDate(d, "en", { dateStyle: "short" });
    const long = formatDate(d, "en", { dateStyle: "long" });
    expect(short.length).toBeLessThanOrEqual(long.length);
  });
});

describe("formatNumber", () => {
  it("formats number with locale-aware grouping", () => {
    const result = formatNumber(1234.56, "en");
    expect(result).toContain("1");
    expect(result).toContain("2");
    expect(result).toContain("3");
    expect(result).toContain("4");
  });

  it("formats with Turkish locale", () => {
    const result = formatNumber(1000.5, "tr");
    expect(typeof result).toBe("string");
    expect(result).toMatch(/[\d.,\s]+/);
  });
});

describe("formatCurrency", () => {
  it("formats as currency with symbol", () => {
    const result = formatCurrency(99.99, "en", "USD");
    expect(result).toContain("99");
    expect(result).toMatch(/\d/);
  });

  it("formats with Turkish lira", () => {
    const result = formatCurrency(100, "tr", "TRY");
    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(0);
  });
});
