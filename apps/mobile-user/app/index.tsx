import { useTranslation } from 'react-i18next';
import { View, Text, StyleSheet } from 'react-native';
import { LanguageSwitcher } from '@myclup/ui-native';
import { changeLanguageAndPersist } from '../src/lib/i18n';

export default function HomeScreen() {
  const { t } = useTranslation('common');
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('label.loading')}</Text>
      <LanguageSwitcher onLanguageChange={changeLanguageAndPersist} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 18,
    marginBottom: 16,
  },
});
