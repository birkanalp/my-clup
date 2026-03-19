import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { AppButton } from './AppButton';
import { AppIcon, type AppIconName } from './AppIcon';
import { AppText } from './AppText';
import { appTheme } from '../theme/appTheme';

type AppStateBlockProps = {
  icon?: AppIconName;
  title: string;
  description?: string;
  loading?: boolean;
  actionLabel?: string;
  onAction?: () => void;
};

export function AppStateBlock({
  icon,
  title,
  description,
  loading = false,
  actionLabel,
  onAction,
}: AppStateBlockProps) {
  return (
    <View style={styles.block}>
      <View style={styles.iconBubble}>
        {loading ? (
          <ActivityIndicator color={appTheme.colors.primary} />
        ) : (
          <AppIcon name={icon ?? 'information-outline'} size={20} color={appTheme.colors.primary} />
        )}
      </View>
      <View style={styles.text}>
        <AppText variant="subtitle" style={styles.title}>
          {title}
        </AppText>
        {description ? (
          <AppText variant="body" tone="muted">
            {description}
          </AppText>
        ) : null}
      </View>
      {actionLabel && onAction ? (
        <AppButton label={actionLabel} onPress={onAction} variant="secondary" />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    alignItems: 'flex-start',
    gap: appTheme.spacing.md,
    padding: appTheme.spacing.lg,
    borderRadius: appTheme.radii.lg,
    backgroundColor: appTheme.colors.surface,
    borderWidth: 1,
    borderColor: appTheme.colors.border,
  },
  iconBubble: {
    width: 40,
    height: 40,
    borderRadius: appTheme.radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: appTheme.colors.surfaceMuted,
  },
  text: {
    gap: 6,
  },
  title: {
    fontSize: 17,
    lineHeight: 23,
    fontWeight: '800',
  },
});
