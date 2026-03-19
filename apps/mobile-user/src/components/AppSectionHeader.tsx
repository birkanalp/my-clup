import { View, StyleSheet } from 'react-native';
import { AppText } from './AppText';
import { appTheme } from '../theme/appTheme';

type AppSectionHeaderProps = {
  title: string;
  subtitle?: string;
};

export function AppSectionHeader({ title, subtitle }: AppSectionHeaderProps) {
  return (
    <View style={styles.header}>
      <View style={styles.text}>
        <AppText variant="subtitle" style={styles.title}>
          {title}
        </AppText>
        {subtitle ? (
          <AppText variant="body" tone="muted">
            {subtitle}
          </AppText>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: 10,
  },
  text: {
    gap: 4,
  },
  title: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '800',
    color: appTheme.colors.text,
  },
});
