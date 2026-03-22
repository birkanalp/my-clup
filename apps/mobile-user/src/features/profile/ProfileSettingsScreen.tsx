import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Card, ScreenContainer } from '@myclup/ui-native';
import type { SupportedLocale } from '@myclup/types';
import { useTranslation } from 'react-i18next';
import { AppButton } from '../../components/AppButton';
import { AppIcon } from '../../components/AppIcon';
import { AppSectionHeader } from '../../components/AppSectionHeader';
import { AppStateBlock } from '../../components/AppStateBlock';
import { AppStatusBadge } from '../../components/AppStatusBadge';
import { AppText } from '../../components/AppText';
import { changeLanguageAndPersist } from '../../lib/i18n';
import { supabase } from '../../lib/supabase';
import { appTheme } from '../../theme/appTheme';
import { buildProfilePatchInput } from './profileForm';
import { useProfile } from './useProfile';

type FeedbackState = {
  message: string | null;
  tone: 'success' | 'danger' | null;
};

const supportedLocales: SupportedLocale[] = ['en', 'tr'];

const placeholderCards = [
  [
    'phone-alert-outline',
    'profile.placeholders.emergencyTitle',
    'profile.placeholders.emergencyBody',
  ],
  ['heart-pulse', 'profile.placeholders.healthTitle', 'profile.placeholders.healthBody'],
  [
    'bell-outline',
    'profile.placeholders.notificationsTitle',
    'profile.placeholders.notificationsBody',
  ],
  ['shield-lock-outline', 'profile.placeholders.privacyTitle', 'profile.placeholders.privacyBody'],
  [
    'file-document-outline',
    'profile.placeholders.agreementsTitle',
    'profile.placeholders.agreementsBody',
  ],
  ['lifebuoy', 'profile.placeholders.helpTitle', 'profile.placeholders.helpBody'],
] as const;

export function ProfileSettingsScreen() {
  const { t } = useTranslation('common');
  const router = useRouter();
  const { data, error, loading, refresh, saveProfile, saving } = useProfile();

  const handleSignOut = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    router.replace('/sign-in');
  };
  const [displayName, setDisplayName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [locale, setLocale] = useState<SupportedLocale>('en');
  const [feedback, setFeedback] = useState<FeedbackState>({ message: null, tone: null });

  useEffect(() => {
    if (!data) {
      return;
    }

    setDisplayName(data.profile.displayName);
    setAvatarUrl(data.profile.avatarUrl ?? '');
    setLocale(data.profile.localePreference.locale);
  }, [data]);

  const handleSave = async () => {
    if (!data) {
      return;
    }

    const patch = buildProfilePatchInput(
      {
        avatarUrl,
        displayName,
        locale,
      },
      data.profile
    );

    if (!patch) {
      setFeedback({ message: t('profile.feedback.noChanges'), tone: 'success' });
      return;
    }

    try {
      await saveProfile(patch);
      if (patch.localePreference?.locale) {
        await changeLanguageAndPersist(patch.localePreference.locale);
      }
      setFeedback({ message: t('profile.feedback.saved'), tone: 'success' });
    } catch {
      setFeedback({ message: t('profile.feedback.error'), tone: 'danger' });
    }
  };

  if (loading) {
    return (
      <ScreenContainer style={styles.screen}>
        <AppStateBlock
          loading
          title={t('profile.loadingTitle')}
          description={t('profile.loadingBody')}
        />
      </ScreenContainer>
    );
  }

  if (error || !data) {
    return (
      <ScreenContainer style={styles.screen}>
        <AppStateBlock
          icon="account-alert-outline"
          title={t('profile.errorTitle')}
          description={t('profile.errorBody')}
          actionLabel={t('cta.retry')}
          onAction={() => void refresh()}
        />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Card style={styles.heroCard}>
          <View style={styles.heroRow}>
            <View style={styles.avatarBubble}>
              <AppIcon name="account-outline" size={28} color={appTheme.colors.primary} />
            </View>
            <View style={styles.heroText}>
              <AppText variant="title" style={styles.heroTitle}>
                {t('profile.title')}
              </AppText>
              <AppText variant="body" tone="muted">
                {t('profile.subtitle')}
              </AppText>
            </View>
          </View>

          <IdentityLine label={t('profile.identity.email')} value={data.user.email ?? '-'} />
          <IdentityLine label={t('profile.identity.phone')} value={data.user.phone ?? '-'} />
          <IdentityLine label={t('profile.identity.userId')} value={data.user.id} />
        </Card>

        <View style={styles.section}>
          <AppSectionHeader
            title={t('profile.supported.title')}
            subtitle={t('profile.supported.subtitle')}
          />
          <Card style={styles.cardBody}>
            <FieldLabel>{t('profile.fields.displayName')}</FieldLabel>
            <TextInput
              accessibilityLabel={t('profile.fields.displayName')}
              autoCapitalize="words"
              onChangeText={setDisplayName}
              placeholder={t('profile.fields.displayNamePlaceholder')}
              placeholderTextColor={appTheme.colors.textSoft}
              style={styles.input}
              value={displayName}
            />

            <FieldLabel>{t('profile.fields.avatarUrl')}</FieldLabel>
            <TextInput
              accessibilityLabel={t('profile.fields.avatarUrl')}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
              onChangeText={setAvatarUrl}
              placeholder={t('profile.fields.avatarUrlPlaceholder')}
              placeholderTextColor={appTheme.colors.textSoft}
              style={styles.input}
              value={avatarUrl}
            />

            <View style={styles.localeHeader}>
              <FieldLabel>{t('profile.fields.language')}</FieldLabel>
              <AppStatusBadge label={t(`profile.locale.${locale}`)} tone="primary" />
            </View>
            <View style={styles.localeOptions}>
              {supportedLocales.map((option) => {
                const active = option === locale;
                return (
                  <Pressable
                    key={option}
                    accessibilityLabel={t(`profile.locale.${option}`)}
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                    onPress={() => setLocale(option)}
                    style={[styles.localeChip, active ? styles.localeChipActive : null]}
                  >
                    <AppText variant="label" tone={active ? 'inverse' : 'primary'}>
                      {t(`profile.locale.${option}`)}
                    </AppText>
                  </Pressable>
                );
              })}
            </View>

            {feedback.message ? (
              <View
                style={[
                  styles.feedbackBanner,
                  feedback.tone === 'danger' ? styles.feedbackDanger : styles.feedbackSuccess,
                ]}
              >
                <AppText
                  variant="body"
                  style={
                    feedback.tone === 'danger'
                      ? styles.feedbackDangerText
                      : styles.feedbackSuccessText
                  }
                >
                  {feedback.message}
                </AppText>
              </View>
            ) : null}

            <AppButton
              label={saving ? t('profile.actions.saving') : t('profile.actions.save')}
              icon="content-save-outline"
              disabled={saving}
              onPress={() => void handleSave()}
            />
          </Card>
        </View>

        <View style={styles.section}>
          <AppSectionHeader
            title={t('profile.linkedGym.title')}
            subtitle={t('profile.linkedGym.subtitle')}
          />
          <Card style={styles.cardBody}>
            <IdentityLine label={t('profile.linkedGym.gymId')} value={data.tenantScope.gymId} />
            <IdentityLine
              label={t('profile.linkedGym.branchId')}
              value={data.tenantScope.branchId ?? t('profile.linkedGym.allBranches')}
            />
            <IdentityLine
              label={t('profile.linkedGym.roles')}
              value={data.roles.map((role) => role.role).join(', ')}
            />
          </Card>
        </View>

        <View style={styles.section}>
          <AppSectionHeader
            title={t('profile.placeholders.title')}
            subtitle={t('profile.placeholders.subtitle')}
          />
          <View style={styles.placeholderGrid}>
            {placeholderCards.map(([icon, titleKey, bodyKey]) => (
              <Card key={titleKey} style={styles.placeholderCard}>
                <View style={styles.placeholderIcon}>
                  <AppIcon name={icon} size={18} color={appTheme.colors.primary} />
                </View>
                <AppText variant="subtitle" style={styles.placeholderTitle}>
                  {t(titleKey)}
                </AppText>
                <AppText variant="body" tone="muted">
                  {t(bodyKey)}
                </AppText>
              </Card>
            ))}
          </View>
        </View>
        <View style={styles.section}>
          <AppButton
            label={t('memberAuth.signOut')}
            icon="logout"
            variant="ghost"
            onPress={() => void handleSignOut()}
          />
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

function FieldLabel({ children }: { children: string }) {
  return (
    <AppText variant="label" style={styles.fieldLabel}>
      {children}
    </AppText>
  );
}

function IdentityLine({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.identityLine}>
      <AppText variant="label" tone="muted">
        {label}
      </AppText>
      <AppText variant="value" style={styles.identityValue}>
        {value}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: appTheme.colors.background,
    padding: 0,
  },
  content: {
    paddingHorizontal: appTheme.spacing.xl,
    paddingTop: appTheme.spacing.md,
    paddingBottom: 36,
    gap: appTheme.spacing.xl,
  },
  heroCard: {
    gap: appTheme.spacing.md,
  },
  heroRow: {
    flexDirection: 'row',
    gap: appTheme.spacing.md,
    alignItems: 'center',
  },
  avatarBubble: {
    width: 64,
    height: 64,
    borderRadius: appTheme.radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: appTheme.colors.primarySoft,
  },
  heroText: {
    flex: 1,
    gap: 4,
  },
  heroTitle: {
    fontSize: 28,
    lineHeight: 34,
  },
  section: {
    gap: appTheme.spacing.md,
  },
  cardBody: {
    gap: appTheme.spacing.md,
  },
  fieldLabel: {
    color: appTheme.colors.text,
  },
  input: {
    borderWidth: 1,
    borderColor: appTheme.colors.border,
    borderRadius: appTheme.radii.md,
    backgroundColor: appTheme.colors.surface,
    paddingHorizontal: appTheme.spacing.md,
    paddingVertical: appTheme.spacing.md,
    color: appTheme.colors.text,
    fontFamily: appTheme.fontFamily,
  },
  localeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: appTheme.spacing.md,
  },
  localeOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: appTheme.spacing.sm,
  },
  localeChip: {
    borderRadius: appTheme.radii.pill,
    paddingHorizontal: appTheme.spacing.md,
    paddingVertical: appTheme.spacing.sm,
    backgroundColor: appTheme.colors.surfaceMuted,
  },
  localeChipActive: {
    backgroundColor: appTheme.colors.primary,
  },
  feedbackBanner: {
    borderRadius: appTheme.radii.md,
    paddingHorizontal: appTheme.spacing.md,
    paddingVertical: appTheme.spacing.sm,
  },
  feedbackSuccess: {
    backgroundColor: appTheme.colors.successSoft,
  },
  feedbackDanger: {
    backgroundColor: appTheme.colors.dangerSoft,
  },
  feedbackSuccessText: {
    color: appTheme.colors.successText,
  },
  feedbackDangerText: {
    color: appTheme.colors.dangerText,
  },
  identityLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: appTheme.spacing.md,
  },
  identityValue: {
    flex: 1,
    textAlign: 'right',
  },
  placeholderGrid: {
    gap: appTheme.spacing.md,
  },
  placeholderCard: {
    gap: appTheme.spacing.md,
  },
  placeholderIcon: {
    width: 38,
    height: 38,
    borderRadius: appTheme.radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: appTheme.colors.primarySoft,
  },
  placeholderTitle: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '800',
  },
});
