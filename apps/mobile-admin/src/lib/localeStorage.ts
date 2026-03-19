/**
 * AsyncStorage helpers for persisted locale preference.
 * Keys and values align with SupportedLocale from @myclup/types.
 */
import AsyncStorage from "@react-native-async-storage/async-storage";

const LOCALE_STORAGE_KEY = "@myclup/locale";

export async function getStoredLocale(): Promise<string | undefined> {
  try {
    return (await AsyncStorage.getItem(LOCALE_STORAGE_KEY)) ?? undefined;
  } catch {
    return undefined;
  }
}

export async function setStoredLocale(locale: string): Promise<void> {
  try {
    await AsyncStorage.setItem(LOCALE_STORAGE_KEY, locale);
  } catch {
    // Ignore persistence errors
  }
}
