import type { TextProps } from 'react-native';
import { Text, StyleSheet } from 'react-native';
import { appTheme } from '../theme/appTheme';

type AppTextVariant = 'body' | 'title' | 'subtitle' | 'eyebrow' | 'caption' | 'label' | 'value';

type AppTextProps = TextProps & {
  variant?: AppTextVariant;
  tone?: 'default' | 'muted' | 'soft' | 'inverse' | 'primary';
};

const variantStyles = StyleSheet.create({
  body: {
    fontSize: 15,
    lineHeight: 22,
  },
  title: {
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '500',
  },
  eyebrow: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  caption: {
    fontSize: 12,
    lineHeight: 16,
  },
  label: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
  },
  value: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
  },
});

const toneStyles = StyleSheet.create({
  default: { color: appTheme.colors.text },
  muted: { color: appTheme.colors.textMuted },
  soft: { color: appTheme.colors.textSoft },
  inverse: { color: appTheme.colors.primaryText },
  primary: { color: appTheme.colors.primary },
});

export function AppText({ style, variant = 'body', tone = 'default', ...props }: AppTextProps) {
  return (
    <Text
      {...props}
      style={[
        {
          fontFamily: appTheme.fontFamily,
        },
        variantStyles[variant],
        toneStyles[tone],
        style,
      ]}
    />
  );
}
