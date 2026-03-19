/**
 * LanguageSwitcher — locale toggle primitive (TR / EN).
 * Uses i18n.changeLanguage and optional onLanguageChange for persistence.
 */
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { SupportedLocale } from '@myclup/types';
import { SUPPORTED_LOCALES } from '@myclup/types';

export interface LanguageSwitcherProps {
  /**
   * Called after changeLanguage. Use for persisting selection (e.g. AsyncStorage).
   */
  onLanguageChange?: (locale: SupportedLocale) => void | Promise<void>;
}

export function LanguageSwitcher({ onLanguageChange }: LanguageSwitcherProps) {
  const { i18n } = useTranslation();
  const current = (i18n.language ?? 'en') as SupportedLocale;

  const handlePress = async (locale: SupportedLocale) => {
    if (locale === current) return;
    await i18n.changeLanguage(locale);
    await onLanguageChange?.(locale);
  };

  return (
    <View style={styles.container}>
      {SUPPORTED_LOCALES.map((locale) => (
        <Pressable
          key={locale}
          onPress={() => handlePress(locale)}
          style={({ pressed }) => [
            styles.option,
            locale === current && styles.optionActive,
            pressed && styles.optionPressed,
          ]}
        >
          <Text style={[styles.optionText, locale === current && styles.optionTextActive]}>
            {locale.toUpperCase()}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 8,
  },
  option: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#e5e7eb',
  },
  optionActive: {
    backgroundColor: '#0ea5e9',
  },
  optionPressed: {
    opacity: 0.8,
  },
  optionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  optionTextActive: {
    color: '#ffffff',
  },
});
