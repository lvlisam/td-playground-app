import React from 'react';
import {
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { useNavigation, type NavigationProp, type ParamListBase } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, font, radius, spacing } from '../theme';

type NotificationIcon = keyof typeof Ionicons.glyphMap;

type BankNotification = {
  id: string;
  title: string;
  detail: string;
  time: string;
  icon: NotificationIcon;
  unread: boolean;
};

const notifications: BankNotification[] = [
  {
    id: 'card-purchase',
    title: 'Card purchase approved',
    detail: '$42.18 at Greenway Market · Card ending 4821.',
    time: '10:42 AM',
    icon: 'card-outline',
    unread: true,
  },
  {
    id: 'payday-deposit',
    title: 'Payday deposit received',
    detail: '$2,450.00 was added to your Everyday Checking account.',
    time: '8:15 AM',
    icon: 'arrow-down-circle-outline',
    unread: true,
  },
  {
    id: 'family-bill',
    title: 'Family bill scheduled',
    detail: 'City Utilities · $184.20 is scheduled for tomorrow.',
    time: 'Yesterday · 4:20 PM',
    icon: 'calendar-outline',
    unread: true,
  },
  {
    id: 'family-goal',
    title: 'Family goal update',
    detail: 'Your household saved $450 this month.',
    time: 'Nov 18 · 9:00 AM',
    icon: 'people-outline',
    unread: false,
  },
];

export default function NotificationsScreen() {
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const compact = width < 360;
  const previewTopInset = Platform.OS === 'web' ? (width < 650 ? 24 : 48) : insets.top;
  const unreadCount = notifications.filter((notification) => notification.unread).length;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
      >
        <View style={[styles.header, compact && styles.headerCompact, { paddingTop: previewTopInset + spacing.sm }]}>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Back to home"
            onPress={() => navigation.navigate('Home')}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={20} color={colors.text} />
          </TouchableOpacity>
          <Text accessibilityRole="header" style={styles.headerTitle}>Notifications</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={[styles.summaryCard, compact && styles.summaryCardCompact]}>
          <View style={styles.summaryIcon}>
            <Ionicons name="notifications-outline" size={20} color={colors.greenDeep} />
          </View>
          <View style={styles.summaryCopy}>
            <Text style={styles.summaryTitle}>You&apos;re up to date</Text>
            <Text style={styles.summaryDetail}>Recent account and family activity</Text>
          </View>
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadBadgeText}>{unreadCount} new</Text>
          </View>
        </View>

        <View style={[styles.section, compact && styles.sectionCompact]}>
          <Text accessibilityRole="header" style={styles.sectionTitle}>Recent activity</Text>
          <View style={styles.notificationList}>
            {notifications.map((notification, index) => (
              <View
                key={notification.id}
                accessible
                accessibilityRole="text"
                accessibilityLabel={`${notification.title}. ${notification.detail} ${notification.time}. ${notification.unread ? 'Unread' : 'Read'}`}
                style={[styles.notificationRow, index === notifications.length - 1 && styles.notificationRowLast]}
              >
                <View style={[styles.notificationIcon, !notification.unread && styles.notificationIconRead]} accessible={false}>
                  <Ionicons name={notification.icon} size={19} color={colors.greenDeep} />
                </View>
                <View style={styles.notificationCopy}>
                  <View style={styles.notificationHeading}>
                    <Text style={styles.notificationTitle}>{notification.title}</Text>
                    {notification.unread ? <View style={styles.unreadDot} accessible={false} /> : null}
                  </View>
                  <Text style={styles.notificationDetail}>{notification.detail}</Text>
                  <Text style={styles.notificationTime}>{notification.time}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={[styles.notice, compact && styles.noticeCompact]}>
          <Ionicons name="information-circle-outline" size={19} color={colors.greenDeep} />
          <Text style={styles.noticeText}>
            Example notifications only. This preview isn&apos;t connected to a live bank account.
          </Text>
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
  summaryCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginHorizontal: spacing.md, padding: spacing.md, borderRadius: radius.xl, backgroundColor: colors.greenDim },
  summaryCardCompact: { marginHorizontal: 12, padding: 12, gap: 9 },
  summaryIcon: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: radius.md, backgroundColor: colors.surface },
  summaryCopy: { flex: 1, minWidth: 0, gap: 2 },
  summaryTitle: { color: colors.text, fontSize: font.size.sm, fontFamily: font.headline.semibold },
  summaryDetail: { color: colors.textSecondary, fontSize: font.size.xs, lineHeight: 17 },
  unreadBadge: { paddingHorizontal: 9, paddingVertical: 5, borderRadius: radius.full, backgroundColor: colors.surface },
  unreadBadgeText: { color: colors.greenDeep, fontSize: 11, fontWeight: font.weight.bold },
  section: { marginTop: spacing.xl, paddingHorizontal: spacing.md },
  sectionCompact: { paddingHorizontal: 12 },
  sectionTitle: { color: colors.text, fontSize: font.size.md, fontFamily: font.headline.semibold, marginBottom: spacing.sm },
  notificationList: { paddingHorizontal: spacing.md, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  notificationRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm, paddingVertical: spacing.md, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.borderFaint },
  notificationRowLast: { borderBottomWidth: 0 },
  notificationIcon: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center', borderRadius: radius.md, backgroundColor: colors.greenDim },
  notificationIconRead: { backgroundColor: colors.surfaceMid },
  notificationCopy: { flex: 1, minWidth: 0, gap: 3 },
  notificationHeading: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  notificationTitle: { flex: 1, color: colors.text, fontSize: font.size.sm, lineHeight: 19, fontFamily: font.headline.semibold },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.greenDeep },
  notificationDetail: { color: colors.textSecondary, fontSize: font.size.xs, lineHeight: 18 },
  notificationTime: { color: colors.textTertiary, fontSize: 10, lineHeight: 14, marginTop: 1 },
  notice: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm, marginHorizontal: spacing.md, marginTop: spacing.lg, padding: spacing.md, borderRadius: radius.md, backgroundColor: colors.surface },
  noticeCompact: { marginHorizontal: 12 },
  noticeText: { flex: 1, color: colors.textSecondary, fontSize: font.size.xs, lineHeight: 17 },
});
