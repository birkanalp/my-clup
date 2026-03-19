import { useTranslation } from 'react-i18next';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Link } from 'expo-router';
import { LanguageSwitcher } from '@myclup/ui-native';
import { changeLanguageAndPersist } from '../src/lib/i18n';

export default function HomeScreen() {
  const { t } = useTranslation(['common', 'chat']);
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('common:label.loading')}</Text>
      <LanguageSwitcher onLanguageChange={changeLanguageAndPersist} />
      <Link href="/chat" asChild>
        <Pressable style={styles.chatLink}>
          <Text style={styles.chatLinkText}>{t('chat:nav.chatCenter')}</Text>
        </Pressable>
      </Link>
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
  chatLink: {
    marginTop: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#2196f3',
    borderRadius: 8,
  },
  chatLinkText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
