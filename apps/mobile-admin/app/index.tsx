import { useTranslation } from 'react-i18next';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { LanguageSwitcher } from '@myclup/ui-native';
import { changeLanguageAndPersist } from '../src/lib/i18n';

export default function HomeScreen() {
  const { t } = useTranslation(['common', 'chat']);
  const router = useRouter();
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('common:label.loading')}</Text>
      <TouchableOpacity style={styles.chatButton} onPress={() => router.push('/chat')}>
        <Text style={styles.chatButtonText}>{t('chat:nav.chatCenter')}</Text>
      </TouchableOpacity>
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
  chatButton: {
    marginBottom: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#2196f3',
    borderRadius: 8,
  },
  chatButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
