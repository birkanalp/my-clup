import { Redirect, Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { useAuthSession } from '../../src/lib/useAuthSession';
import { useStaffWhoami } from '../../src/features/staff/useStaffWhoami';
import { getTabVisibility, rolesFromWhoami } from '../../src/features/staff/navVisibility';

export default function StaffTabsLayout() {
  const { t } = useTranslation('common');
  const { session, loading: authLoading } = useAuthSession();
  const { whoami, loading: whoamiLoading } = useStaffWhoami(Boolean(session));

  if (authLoading || (session && whoamiLoading)) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!session) {
    return <Redirect href="/sign-in" />;
  }

  const roleList = whoami ? rolesFromWhoami(whoami.roles) : [];
  const vis = getTabVisibility(roleList);

  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="index" options={{ title: t('staffTabs.home') }} />
      <Tabs.Screen
        name="members"
        options={{
          title: t('staffTabs.members'),
          href: vis.members ? undefined : null,
        }}
      />
      <Tabs.Screen
        name="schedule"
        options={{
          title: t('staffTabs.schedule'),
          href: vis.schedule ? undefined : null,
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: t('staffTabs.chat'),
          href: vis.chat ? undefined : null,
        }}
      />
      <Tabs.Screen
        name="workouts"
        options={{
          title: t('staffTabs.workouts'),
          href: vis.workouts ? undefined : null,
        }}
      />
      <Tabs.Screen
        name="sales"
        options={{
          title: t('staffTabs.sales'),
          href: vis.sales ? undefined : null,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
