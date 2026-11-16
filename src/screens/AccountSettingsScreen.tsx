import React from 'react';
import { Platform, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { useNavigation, type NavigationProp, type ParamListBase } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, font, radius, spacing } from '../theme';
import { useDashboardProfile } from '../personas';

const createSettingsOverview = (name: string) => [
  { icon: 'person-outline' as const, title: 'Profile information', detail: `Account holder: ${name}` },
  { icon: 'lock-closed-outline' as const, title: 'Security & sign-in', detail: 'Secure sign-in preferences' },
  { icon: 'notifications-outline' as const, title: 'Alerts & notifications', detail: 'Account activity and reminders' },
  { icon: 'shield-checkmark-outline' as const, title: 'Privacy & data', detail: 'Privacy preferences and permissions' },
];

export default function AccountSettingsScreen() {
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const { activeProfile } = useDashboardProfile();
  const settingsOverview = createSettingsOverview(activeProfile.name);
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const compact = width < 360;
  const previewTopInset = Platform.OS === 'web' ? (width < 650 ? 24 : 48) : insets.top;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}>
        <View style={[styles.header, compact && styles.headerCompact, { paddingTop: previewTopInset + spacing.sm }]}>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Back to home"
            onPress={() => navigation.navigate('Home')}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={20} color={colors.text} />
          </TouchableOpacity>
          <Text accessibilityRole="header" style={styles.headerTitle}>Account settings</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={[styles.profileCard, compact && styles.profileCardCompact]}>
          <View style={styles.avatar} accessible={false}>
            <Text style={styles.avatarInitials}>{activeProfile.initials}</Text>
          </View>
          <View style={styles.profileCopy}>
            <Text style={styles.profileEyebrow}>{activeProfile.relationship.toUpperCase()} PROFILE</Text>
            <Text style={styles.profileName}>{activeProfile.name}</Text>
            <Text style={styles.profileDescription}>Manage {activeProfile.name}’s profile and banking preferences.</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text accessibilityRole="header" style={styles.sectionTitle}>Settings overview</Text>
          <View style={styles.settingsCard}>
            {settingsOverview.map((item, index) => (
              <View key={item.title}>
                {index > 0 ? <View style={styles.divider} /> : null}
                <View accessible accessibilityRole="text" accessibilityLabel={`${item.title}. ${item.detail}`} style={styles.settingRow}>
                  <View style={styles.settingIcon}>
                    <Ionicons name={item.icon} size={18} color={colors.greenDeep} />
                  </View>
                  <View style={styles.settingCopy}>
                    <Text style={styles.settingTitle}>{item.title}</Text>
                    <Text style={styles.settingDetail}>{item.detail}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.notice}>
          <Ionicons name="information-circle-outline" size={19} color={colors.greenDeep} />
          <Text style={styles.noticeText}>This account settings screen is a preview and isn’t connected to a live bank account.</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: { minHeight: 62, flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingHorizontal: spacing.md, paddingBottom: spacing.md },
  headerCompact: { paddingHorizontal: 14 },
  backButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: radius.full, backgroundColor: colors.surface },
  headerTitle: { color: colors.text, fontSize: font.size.lg, fontFamily: font.headline.semibold },
  headerSpacer: { flex: 1 },
  profileCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginHorizontal: spacing.md, padding: spacing.md, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  profileCardCompact: { marginHorizontal: 12, padding: 14, gap: 12 },
  avatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: colors.greenDim, alignItems: 'center', justifyContent: 'center' },
  avatarInitials: { color: colors.greenDeep, fontSize: 18, lineHeight: 23, fontFamily: font.body.bold },
  profileCopy: { flex: 1, minWidth: 0, gap: 2 },
  profileEyebrow: { color: colors.greenDeep, fontSize: 10, lineHeight: 14, fontFamily: font.body.bold, letterSpacing: 0.7 },
  profileName: { color: colors.text, fontSize: 23, lineHeight: 28, fontFamily: font.headline.bold },
  profileDescription: { color: colors.textSecondary, fontSize: font.size.sm, lineHeight: 20 },
  section: { marginTop: spacing.xl, paddingHorizontal: spacing.md },
  sectionTitle: { color: colors.text, fontSize: font.size.md, fontFamily: font.headline.semibold, marginBottom: spacing.sm },
  settingsCard: { paddingHorizontal: spacing.md, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  settingRow: { minHeight: 68, flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  settingIcon: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center', borderRadius: radius.md, backgroundColor: colors.greenDim },
  settingCopy: { flex: 1, minWidth: 0, gap: 2 },
  settingTitle: { color: colors.text, fontSize: font.size.sm, fontFamily: font.headline.semibold },
  settingDetail: { color: colors.textSecondary, fontSize: font.size.xs, lineHeight: 17 },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: colors.borderFaint },
  notice: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm, marginHorizontal: spacing.md, marginTop: spacing.lg, padding: spacing.md, borderRadius: radius.md, backgroundColor: colors.greenDim },
  noticeText: { flex: 1, color: colors.textSecondary, fontSize: font.size.xs, lineHeight: 17 },
});
