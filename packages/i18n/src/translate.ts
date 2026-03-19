/**
 * @myclup/i18n — Framework-agnostic translation core.
 *
 * Translation namespaces: common, auth, membership, chat, errors.
 * Fallback: requested locale → FALLBACK_LOCALE (en) → key string.
 */
import type { SupportedLocale } from "@myclup/types";
import { FALLBACK_LOCALE } from "@myclup/types";

import { i18nextResources } from "./resources";
import type { TranslationNamespace } from "./resources";

export type { TranslationNamespace };

const RESOURCES = i18nextResources;

export interface TranslateParams {
  [key: string]: string | number;
}

/** Plural form keys supported for pluralization */
type PluralForm = "zero" | "one" | "two" | "few" | "many" | "other";

/**
 * Determine plural form for a given count and locale.
 * Simplified: supports "one" (count===1) and "other" for en/tr.
 */
function getPluralForm(count: number, _locale: SupportedLocale): PluralForm {
  if (count === 0) return "zero";
  if (count === 1) return "one";
  if (count === 2) return "two";
  return "other";
}

/**
 * Get nested value from an object using dot-notation key.
 */
function getNested(obj: unknown, key: string): unknown {
  const parts = key.split(".");
  let current: unknown = obj;
  for (const part of parts) {
    if (current === null || current === undefined || typeof current !== "object") {
      return undefined;
    }
    current = (current as Record<string, unknown>)[part];
  }
  return current;
}

/**
 * Replace {{var}} placeholders in string with params.
 */
function interpolate(template: string, params?: TranslateParams): string {
  if (!params) return template;
  return template.replace(/\{\{(\w+)\}\}/g, (_, name) => {
    const value = params[name];
    return value !== undefined ? String(value) : `{{${name}}}`;
  });
}

/**
 * Translate a key for the given locale, namespace, and optional params.
 *
 * Fallback order: requested locale → FALLBACK_LOCALE (en) → key string.
 * Supports interpolation via {{var}} and pluralization via { one, other } objects.
 *
 * @param locale - Target locale (tr | en)
 * @param namespace - Translation namespace (common, auth, membership, chat, errors)
 * @param key - Dot-notation key (e.g. "button.save", "errors.validation.required")
 * @param params - Optional interpolation params and count for pluralization
 * @returns Translated string or key if not found
 */
export function t(
  locale: SupportedLocale,
  namespace: TranslationNamespace,
  key: string,
  params?: TranslateParams
): string {
  const localesToTry: SupportedLocale[] = [locale, FALLBACK_LOCALE];
  let raw: unknown;

  for (const loc of localesToTry) {
    const ns = RESOURCES[loc][namespace];
    raw = getNested(ns, key);
    if (raw !== undefined) break;
  }

  if (raw === undefined) {
    return key;
  }

  // Pluralization: value is { one, other, ... }
  if (params?.count !== undefined && typeof raw === "object" && raw !== null && !Array.isArray(raw)) {
    const pluralForm = getPluralForm(Number(params.count), locale);
    const pluralObj = raw as Record<PluralForm, string>;
    const pluralValue = pluralObj[pluralForm] ?? pluralObj.other ?? pluralObj.one ?? String(key);
    return interpolate(pluralValue, params);
  }

  if (typeof raw === "string") {
    return interpolate(raw, params);
  }

  return key;
}
