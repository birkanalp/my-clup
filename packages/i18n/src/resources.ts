/**
 * @myclup/i18n — i18next-compatible resource bundle.
 *
 * Exported for react-i18next and other i18next consumers.
 * Resources match the structure expected by i18next: { locale: { namespace: translations } }
 */
import type { SupportedLocale } from "@myclup/types";

export type TranslationNamespace = "common" | "auth" | "membership" | "chat" | "errors";

import commonEn from "./namespaces/common/en.json";
import commonTr from "./namespaces/common/tr.json";
import authEn from "./namespaces/auth/en.json";
import authTr from "./namespaces/auth/tr.json";
import membershipEn from "./namespaces/membership/en.json";
import membershipTr from "./namespaces/membership/tr.json";
import chatEn from "./namespaces/chat/en.json";
import chatTr from "./namespaces/chat/tr.json";
import errorsEn from "./namespaces/errors/en.json";
import errorsTr from "./namespaces/errors/tr.json";

type ResourceRecord = Record<string, unknown>;

/**
 * i18next-compatible resources: { en: { common: {...}, auth: {...}, ... }, tr: { ... } }
 * Use with i18next.use(ResourceStore) or addResourceBundle.
 *
 * Also suitable for next-intl: messages = i18nextResources[locale] yields
 * { common, auth, membership, chat, errors } for useTranslations(namespace).
 */
export const i18nextResources: Record<
  SupportedLocale,
  Record<TranslationNamespace, ResourceRecord>
> = {
  en: {
    common: commonEn as ResourceRecord,
    auth: authEn as ResourceRecord,
    membership: membershipEn as ResourceRecord,
    chat: chatEn as ResourceRecord,
    errors: errorsEn as ResourceRecord,
  },
  tr: {
    common: commonTr as ResourceRecord,
    auth: authTr as ResourceRecord,
    membership: membershipTr as ResourceRecord,
    chat: chatTr as ResourceRecord,
    errors: errorsTr as ResourceRecord,
  },
};
