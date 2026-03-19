import { getRequestConfig } from "next-intl/server";
import {
  i18nextResources,
  DEFAULT_LOCALE,
  SUPPORTED_LOCALES,
  type SupportedLocale,
} from "@myclup/i18n";

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale =
    requested && SUPPORTED_LOCALES.includes(requested as SupportedLocale)
      ? (requested as SupportedLocale)
      : DEFAULT_LOCALE;

  const messages = i18nextResources[locale];

  return {
    locale,
    messages: messages as import("next-intl").AbstractIntlMessages,
  };
});
