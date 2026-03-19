import type { PropsWithChildren } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { AppIcon, type AppIconName } from './AppIcon';
import { AppText } from './AppText';
import { appTheme } from '../theme/appTheme';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';

type AppButtonProps = PropsWithChildren<{
  label: string;
  icon?: AppIconName;
  variant?: ButtonVariant;
  disabled?: boolean;
  onPress?: () => void;
}>;

export function AppButton({
  label,
  icon,
  variant = 'primary',
  disabled = false,
  onPress,
}: AppButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        variantStyles[variant],
        disabled ? styles.disabled : null,
        pressed && !disabled ? styles.pressed : null,
      ]}
    >
      <View style={styles.inner}>
        {icon ? (
          <AppIcon
            name={icon}
            size={18}
            color={variant === 'primary' ? appTheme.colors.primaryText : appTheme.colors.primary}
          />
        ) : null}
        <AppText
          variant="label"
          tone={variant === 'primary' ? 'inverse' : 'primary'}
          style={styles.label}
        >
          {label}
        </AppText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: appTheme.radii.pill,
    paddingHorizontal: appTheme.spacing.lg,
    paddingVertical: appTheme.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  label: {
    textAlign: 'center',
  },
  disabled: {
    opacity: 0.55,
  },
  pressed: {
    transform: [{ scale: 0.985 }],
  },
});

const variantStyles = StyleSheet.create({
  primary: {
    backgroundColor: appTheme.colors.primary,
  },
  secondary: {
    backgroundColor: appTheme.colors.secondarySoft,
  },
  ghost: {
    backgroundColor: appTheme.colors.surfaceMuted,
  },
});
