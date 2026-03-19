import { StyleSheet, View } from 'react-native';
import { AppText } from './AppText';
import { appTheme } from '../theme/appTheme';

type BadgeTone = 'primary' | 'success' | 'warning' | 'danger' | 'neutral';

type AppStatusBadgeProps = {
  label: string;
  tone?: BadgeTone;
};

export function AppStatusBadge({ label, tone = 'neutral' }: AppStatusBadgeProps) {
  return (
    <View style={[styles.badge, toneStyles[tone]]}>
      <AppText variant="caption" tone={toneTextTone[tone]} style={styles.label}>
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderRadius: appTheme.radii.pill,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  label: {
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});

const toneStyles = StyleSheet.create({
  primary: { backgroundColor: appTheme.colors.primarySoft },
  success: { backgroundColor: appTheme.colors.successSoft },
  warning: { backgroundColor: appTheme.colors.warningSoft },
  danger: { backgroundColor: appTheme.colors.dangerSoft },
  neutral: { backgroundColor: appTheme.colors.surfaceMuted },
});

const toneTextTone: Record<BadgeTone, 'primary' | 'default' | 'soft'> = {
  primary: 'primary',
  success: 'default',
  warning: 'default',
  danger: 'default',
  neutral: 'soft',
};
