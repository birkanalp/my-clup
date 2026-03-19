import type { ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

type ButtonVariant = 'primary' | 'secondary';
type StatusTone = 'neutral' | 'success' | 'warning' | 'danger' | 'info';
type StateKind = 'loading' | 'empty' | 'error';

export interface ScreenContainerProps {
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export function ScreenContainer({ children, style, testID }: ScreenContainerProps) {
  return (
    <View testID={testID} style={[styles.screen, style]}>
      {children}
    </View>
  );
}

export interface CardProps {
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export function Card({ children, style, testID }: CardProps) {
  return (
    <View testID={testID} style={[styles.card, style]}>
      {children}
    </View>
  );
}

export interface ButtonProps {
  accessibilityLabel?: string;
  children?: ReactNode;
  disabled?: boolean;
  onPress?: () => void;
  testID?: string;
  variant?: ButtonVariant;
}

export function Button({
  accessibilityLabel,
  children,
  disabled,
  onPress,
  testID,
  variant = 'primary',
}: ButtonProps) {
  const isSecondary = variant === 'secondary';

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      testID={testID}
      onPress={onPress}
      style={[
        styles.buttonBase,
        isSecondary ? styles.buttonSecondary : styles.buttonPrimary,
        disabled && styles.buttonDisabled,
      ]}
    >
      <Text
        style={[
          styles.buttonLabel,
          isSecondary ? styles.buttonLabelSecondary : styles.buttonLabelPrimary,
        ]}
      >
        {children}
      </Text>
    </Pressable>
  );
}

export interface SectionHeaderProps {
  actionLabel?: string;
  actionAccessibilityLabel?: string;
  children?: ReactNode;
  onAction?: () => void;
  subtitle?: string;
  testID?: string;
  title: string;
}

export function SectionHeader({
  actionLabel,
  actionAccessibilityLabel,
  children,
  onAction,
  subtitle,
  testID,
  title,
}: SectionHeaderProps) {
  return (
    <View testID={testID} style={styles.sectionHeader}>
      <View style={styles.sectionHeaderText}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {subtitle ? <Text style={styles.sectionSubtitle}>{subtitle}</Text> : null}
      </View>
      {actionLabel && onAction ? (
        <Pressable
          accessibilityLabel={actionAccessibilityLabel ?? actionLabel}
          accessibilityRole="button"
          onPress={onAction}
          style={styles.sectionAction}
        >
          <Text style={styles.sectionActionLabel}>{actionLabel}</Text>
        </Pressable>
      ) : null}
      {children}
    </View>
  );
}

export interface StatusBadgeProps {
  label: string;
  tone?: StatusTone;
  testID?: string;
}

export function StatusBadge({ label, tone = 'neutral', testID }: StatusBadgeProps) {
  return (
    <View testID={testID} style={[styles.badge, badgeToneStyles[tone]]}>
      <Text style={styles.badgeLabel}>{label}</Text>
    </View>
  );
}

export interface StateBlockProps {
  actionLabel?: string;
  children?: ReactNode;
  description?: string;
  kind?: StateKind;
  onAction?: () => void;
  testID?: string;
  title: string;
}

export function StateBlock({
  actionLabel,
  children,
  description,
  kind = 'empty',
  onAction,
  testID,
  title,
}: StateBlockProps) {
  return (
    <View
      accessibilityLiveRegion={kind === 'loading' ? 'polite' : 'none'}
      testID={testID}
      style={styles.stateBlock}
    >
      <View style={styles.stateIconWrap}>
        {kind === 'loading' ? (
          <ActivityIndicator color="#0f766e" />
        ) : (
          <View style={[styles.stateIcon, stateToneStyles[kind]]} />
        )}
      </View>
      <Text style={styles.stateTitle}>{title}</Text>
      {description ? <Text style={styles.stateDescription}>{description}</Text> : null}
      {children}
      {actionLabel && onAction ? (
        <Button variant="secondary" onPress={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f8fafc',
    padding: 20,
  },
  card: {
    borderRadius: 20,
    backgroundColor: '#ffffff',
    padding: 18,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#0f172a',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  buttonBase: {
    minHeight: 48,
    paddingHorizontal: 18,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPrimary: {
    backgroundColor: '#0f766e',
  },
  buttonSecondary: {
    backgroundColor: '#dbeafe',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonLabel: {
    fontSize: 15,
    fontWeight: '700',
  },
  buttonLabelPrimary: {
    color: '#ffffff',
  },
  buttonLabelSecondary: {
    color: '#1d4ed8',
  },
  sectionHeader: {
    gap: 10,
  },
  sectionHeaderText: {
    gap: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
  },
  sectionSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: '#475569',
  },
  sectionAction: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    backgroundColor: '#e0f2fe',
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  sectionActionLabel: {
    color: '#0369a1',
    fontSize: 13,
    fontWeight: '700',
  },
  badge: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  badgeLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0f172a',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  stateBlock: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    borderRadius: 24,
    backgroundColor: '#ffffff',
    padding: 24,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  stateIconWrap: {
    minHeight: 44,
    minWidth: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stateIcon: {
    height: 18,
    width: 18,
    borderRadius: 999,
  },
  stateTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0f172a',
    textAlign: 'center',
  },
  stateDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: '#475569',
    textAlign: 'center',
  },
});

const badgeToneStyles = StyleSheet.create({
  neutral: {
    backgroundColor: '#e2e8f0',
  },
  success: {
    backgroundColor: '#dcfce7',
  },
  warning: {
    backgroundColor: '#fef3c7',
  },
  danger: {
    backgroundColor: '#fee2e2',
  },
  info: {
    backgroundColor: '#dbeafe',
  },
});

const stateToneStyles = StyleSheet.create({
  loading: {
    backgroundColor: '#0f766e',
  },
  empty: {
    backgroundColor: '#94a3b8',
  },
  error: {
    backgroundColor: '#dc2626',
  },
});
