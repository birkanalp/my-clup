import type { PropsWithChildren } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { usePathname, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from '@myclup/ui-native';
import { changeLanguageAndPersist } from '../lib/i18n';
import { AppIcon } from './AppIcon';
import { AppText } from './AppText';
import { appTheme } from '../theme/appTheme';
import { isShellRouteActive, shellNavItems } from './appShellNavigation';

export function AppShell({ children }: PropsWithChildren) {
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useTranslation('common');

  return (
    <View style={styles.shell}>
      <View style={styles.backgroundGlow} />
      <View style={styles.backgroundGlowAlt} />

      <View style={styles.header}>
        <View style={styles.headerText}>
          <AppText variant="eyebrow" tone="soft">
            {t('shell.eyebrow')}
          </AppText>
          <AppText variant="subtitle" style={styles.appTitle}>
            {t('shell.app')}
          </AppText>
          <AppText variant="caption" tone="muted">
            {t('shell.subtitle')}
          </AppText>
        </View>
        <LanguageSwitcher onLanguageChange={changeLanguageAndPersist} />
      </View>

      <View style={styles.content}>{children}</View>

      <View style={styles.navWrap}>
        <View style={styles.nav}>
          {shellNavItems.map((item) => {
            const active = isShellRouteActive(pathname, item.href);
            return (
              <Pressable
                key={item.href}
                accessibilityRole="button"
                accessibilityLabel={t(item.labelKey)}
                accessibilityState={{ selected: active }}
                onPress={() => router.push(item.href)}
                style={[styles.navItem, active ? styles.navItemActive : null]}
              >
                <AppIcon
                  name={item.icon}
                  size={20}
                  color={active ? appTheme.colors.primary : appTheme.colors.textSoft}
                />
                <AppText
                  variant="caption"
                  tone={active ? 'primary' : 'soft'}
                  style={styles.navLabel}
                >
                  {t(item.labelKey)}
                </AppText>
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    flex: 1,
    backgroundColor: appTheme.colors.background,
  },
  backgroundGlow: {
    position: 'absolute',
    top: -120,
    right: -80,
    width: 220,
    height: 220,
    borderRadius: 220,
    backgroundColor: '#c7f0ea',
    opacity: 0.55,
  },
  backgroundGlowAlt: {
    position: 'absolute',
    left: -100,
    top: 120,
    width: 200,
    height: 200,
    borderRadius: 200,
    backgroundColor: '#dbeafe',
    opacity: 0.5,
  },
  header: {
    paddingHorizontal: appTheme.spacing.xl,
    paddingTop: 18,
    paddingBottom: appTheme.spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: appTheme.spacing.md,
  },
  headerText: {
    flex: 1,
    gap: 2,
  },
  appTitle: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '800',
    color: appTheme.colors.text,
  },
  content: {
    flex: 1,
  },
  navWrap: {
    paddingHorizontal: appTheme.spacing.lg,
    paddingBottom: appTheme.spacing.lg,
    paddingTop: appTheme.spacing.sm,
  },
  nav: {
    flexDirection: 'row',
    gap: appTheme.spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderWidth: 1,
    borderColor: appTheme.colors.border,
    borderRadius: appTheme.radii.xl,
    padding: 8,
  },
  navItem: {
    flex: 1,
    borderRadius: appTheme.radii.lg,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  navItemActive: {
    backgroundColor: appTheme.colors.primarySoft,
  },
  navLabel: {
    fontWeight: '700',
  },
});
