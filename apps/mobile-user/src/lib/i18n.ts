/**
 * i18next instance for mobile-user.
 * Resources from @myclup/i18n; fallback en then key.
 */
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { FALLBACK_LOCALE, type SupportedLocale } from "@myclup/types";
import { i18nextResources } from "@myclup/i18n";
import { isValidLocale } from "@myclup/utils";
import { getStoredLocale, setStoredLocale } from "./localeStorage";
import { detectDeviceLocale } from "./locale";

export type { SupportedLocale };

/**
 * Resolve initial locale: persisted > device > default.
 */
export async function resolveInitialLocale(): Promise<SupportedLocale> {
  const stored = await getStoredLocale();
  if (stored && isValidLocale(stored)) {
    return stored as SupportedLocale;
  }
  return detectDeviceLocale();
}

/**
 * Initialize i18next with resources from @myclup/i18n.
 * Call before rendering the app.
 */
export async function initI18n(): Promise<void> {
  const locale = await resolveInitialLocale();
  await i18n.use(initReactI18next).init({
    resources: i18nextResources,
    lng: locale,
    fallbackLng: FALLBACK_LOCALE,
    defaultNS: "common",
    ns: ["common", "auth", "membership", "chat", "errors"],
    interpolation: {
      escapeValue: false, // React escapes by default
    },
    react: {
      useSuspense: true,
    },
  });
}

/**
 * Change language and persist selection.
 */
export async function changeLanguageAndPersist(locale: SupportedLocale): Promise<void> {
  await i18n.changeLanguage(locale);
  await setStoredLocale(locale);
}

export { i18n };
