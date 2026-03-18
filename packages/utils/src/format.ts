/**
 * Locale-aware formatting helpers.
 * Uses Intl APIs; accepts SupportedLocale for consistent platform-wide formatting.
 */
import type { SupportedLocale } from "@myclup/types";

/** Options for formatDate. */
export interface FormatDateOptions {
  dateStyle?: "full" | "long" | "medium" | "short";
  weekday?: "long" | "short" | "narrow";
  year?: "numeric" | "2-digit";
  month?: "numeric" | "2-digit" | "long" | "short" | "narrow";
  day?: "numeric" | "2-digit";
}

/** Options for formatTime. */
export interface FormatTimeOptions {
  timeStyle?: "full" | "long" | "medium" | "short";
  hour?: "numeric" | "2-digit";
  minute?: "numeric" | "2-digit";
  second?: "numeric" | "2-digit";
  hour12?: boolean;
}

/** Options for formatNumber. */
export interface FormatNumberOptions {
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
  useGrouping?: boolean;
}

/** Options for formatCurrency. */
export interface FormatCurrencyOptions {
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
}

/**
 * Format a Date as a locale-aware date string.
 */
export function formatDate(
  value: Date,
  locale: SupportedLocale,
  options?: FormatDateOptions
): string {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: options?.dateStyle ?? "medium",
    ...options,
  }).format(value);
}

/**
 * Format a Date as a locale-aware time string.
 */
export function formatTime(
  value: Date,
  locale: SupportedLocale,
  options?: FormatTimeOptions
): string {
  return new Intl.DateTimeFormat(locale, {
    timeStyle: options?.timeStyle ?? "short",
    ...options,
  }).format(value);
}

/**
 * Format a number with locale-aware grouping and decimal separators.
 */
export function formatNumber(
  value: number,
  locale: SupportedLocale,
  options?: FormatNumberOptions
): string {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: options?.minimumFractionDigits,
    maximumFractionDigits: options?.maximumFractionDigits ?? 2,
    useGrouping: options?.useGrouping ?? true,
  }).format(value);
}

/**
 * Format a number as currency.
 */
export function formatCurrency(
  value: number,
  locale: SupportedLocale,
  currencyCode: string,
  options?: FormatCurrencyOptions
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currencyCode,
    minimumFractionDigits: options?.minimumFractionDigits,
    maximumFractionDigits: options?.maximumFractionDigits ?? 2,
  }).format(value);
}

/**
 * Format a measurement value with locale-aware unit display.
 * @param unit - BCP 47 unit identifier (e.g. "kilogram", "meter", "liter")
 */
export function formatUnit(
  value: number,
  unit: string,
  locale: SupportedLocale,
  options?: { maximumFractionDigits?: number }
): string {
  return new Intl.NumberFormat(locale, {
    style: "unit",
    unit,
    maximumFractionDigits: options?.maximumFractionDigits ?? 1,
  }).format(value);
}
