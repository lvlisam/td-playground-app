import React from 'react';
import { useNavigation, type NavigationProp, type ParamListBase } from '@react-navigation/native';
import {
  Image,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, font } from '../theme';

const palette = {
  background: colors.bg,
  surface: colors.surface,
  ink: colors.text,
  green: colors.green,
  greenDeep: colors.greenDeep,
};

const accountInsights = [
  {
    id: 'savings',
    icon: 'trending-up-outline',
    eyebrow: 'SAVINGS',
    title: 'Your savings are on a roll',
    metric: '+$240',
    detail: 'You added more to savings this month than last.',
  },
  {
    id: 'spending',
    icon: 'restaurant-outline',
    eyebrow: 'SPENDING',
    title: 'Dining spend is trending down',
    metric: '−12%',
    detail: 'You spent less dining out than in the prior month.',
  },
  {
    id: 'rewards',
    icon: 'sparkles-outline',
    eyebrow: 'CARD REWARDS',
    title: 'Points are ready to use',
    metric: '18,420 pts',
    detail: 'Your TD Double Up Card rewards are adding up.',
  },
] as const;

const accounts = [
  {
    id: 'checking',
    name: 'TD Complete Checking',
    detail: '•••• 4821',
    amount: '$6,842.17',
    swatch: palette.green,
  },
  {
    id: 'savings',
    name: 'TD Simple Savings',
    detail: '•••• 9310 · 4.60% APY',
    note: '4 Vaults · $31,770 inside',
    amount: '$53,220.00',
    swatch: palette.green,
  },
  {
    id: 'card',
    name: 'TD Double Up Card',
    detail: '$10,715.44 available',
    note: '18,420 TD Points',
    amount: '−$1,284.56',
    swatch: palette.ink,
  },
];

function AccountRow({ account, last, compact }: { account: (typeof accounts)[number]; last: boolean; compact: boolean }) {
  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={`${account.name}, ${account.amount}`}
      style={[styles.accountRow, compact && styles.accountRowCompact, !last && styles.accountDivider]}
    >
      <View style={[styles.accountMark, compact && styles.accountMarkCompact, { backgroundColor: account.swatch }]}>
        <View style={styles.accountMarkLine} />
      </View>
      <View style={styles.accountCopy}>
        <Text numberOfLines={1} style={[styles.accountName, compact && styles.accountNameCompact]}>{account.name}</Text>
        <Text numberOfLines={1} style={[styles.accountDetail, compact && styles.accountDetailCompact]}>{account.detail}</Text>
        {account.note ? <Text numberOfLines={1} style={[styles.accountNote, compact && styles.accountNoteCompact]}>{account.note}</Text> : null}
      </View>
      <Text numberOfLines={1} style={[styles.accountAmount, compact && styles.accountAmountCompact]}>{account.amount}</Text>
      <Ionicons name="chevron-forward" size={compact ? 14 : 17} color="rgba(22,25,23,0.58)" />
    </TouchableOpacity>
  );
}

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const { width } = useWindowDimensions();
  const compact = width < 360;
  const previewTopInset = Platform.OS === 'web' ? (width < 650 ? 24 : 48) : insets.top;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 78 }}
      >
        <View style={[styles.hero, compact && styles.heroCompact]}>
          <Image
            source={require('../../assets/nyc-skyline.png')}
            resizeMode="cover"
            style={[StyleSheet.absoluteFill, styles.heroImage]}
            accessible={false}
          />
          <LinearGradient
            colors={['rgba(0,87,63,0.78)', 'rgba(0,87,63,0.42)', 'rgba(0,87,63,0.12)', 'rgba(246,247,246,0.94)']}
            locations={[0, 0.44, 0.72, 1]}
            style={[StyleSheet.absoluteFill, styles.heroGradient]}
          />
          <View style={[styles.heroForeground, compact && styles.heroForegroundCompact, { paddingTop: previewTopInset + (compact ? 8 : 12) }]}>
            <View style={[styles.topBar, compact && styles.topBarCompact]}>
            <View style={[styles.identity, compact && styles.identityCompact]}>
              <View style={[styles.tdLogo, compact && styles.tdLogoCompact]}><Text style={[styles.tdLogoText, compact && styles.tdLogoTextCompact]}>TD</Text></View>
              <View>
                <Text style={[styles.greeting, compact && styles.greetingCompact]}>Good afternoon,</Text>
                <Text style={[styles.customerName, compact && styles.customerNameCompact]}>Maya <Ionicons name="chevron-forward" size={compact ? 13 : 15} color={colors.white} /></Text>
              </View>
            </View>
            <View style={[styles.topActions, compact && styles.topActionsCompact]}>
              <TouchableOpacity accessibilityRole="button" accessibilityLabel="Talk to Tedi" style={[styles.tediButton, compact && styles.tediButtonCompact]}>
                <View style={[styles.tediMark, compact && styles.tediMarkCompact]}><Ionicons name="sparkles-outline" size={compact ? 14 : 18} color={palette.green} /></View>
                <Text style={[styles.tediText, compact && styles.tediTextCompact]}>Tedi</Text>
              </TouchableOpacity>
              <TouchableOpacity accessibilityRole="button" accessibilityLabel="Notifications, 3 unread" style={[styles.notificationButton, compact && styles.notificationButtonCompact]}>
                <Ionicons name="notifications-outline" size={compact ? 18 : 22} color={colors.white} />
                <View style={styles.notificationCount}><Text style={styles.notificationCountText}>3</Text></View>
              </TouchableOpacity>
            </View>
          </View>

          <View style={[styles.balanceBlock, compact && styles.balanceBlockCompact]}>
            <Text style={[styles.balance, compact && styles.balanceCompact]}>$60,062.17</Text>
          </View>
          </View>
        </View>

        <View style={[styles.content, compact && styles.contentCompact]}>
          <Text style={[styles.sectionTitle, compact && styles.sectionTitleCompact]}>Your accounts</Text>
          <View
            accessible
            accessibilityRole="text"
            accessibilityLabel="Fee waived this month. Direct deposit covers your $5 monthly fee."
            style={[styles.feeNotice, compact && styles.feeNoticeCompact]}
          >
            <Ionicons name="checkmark-circle" size={compact ? 18 : 20} color={palette.green} />
            <View style={styles.feeNoticeCopy}>
              <Text style={styles.feeNoticeText}>Fee waived this month</Text>
              <Text style={styles.feeNoticeSubtext}>Direct deposit covers your $5 monthly fee</Text>
            </View>
          </View>

          <View style={styles.accountList}>
            {accounts.map((account, index) => (
              <AccountRow key={account.id} account={account} last={index === accounts.length - 1} compact={compact} />
            ))}
          </View>

          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Move money"
            onPress={() => navigation.navigate('Pay & Transfer')}
            style={[styles.moveMoneyButton, compact && styles.moveMoneyButtonCompact]}
          >
            <Ionicons name="swap-horizontal" size={compact ? 19 : 20} color={palette.ink} />
            <Text style={[styles.moveMoneyText, compact && styles.moveMoneyTextCompact]}>Move money</Text>
            <Ionicons name="arrow-forward" size={compact ? 16 : 18} color={palette.ink} />
          </TouchableOpacity>

          <View style={styles.offersHeading}>
            <View style={styles.offersTitleGroup}>
              <View style={styles.smallTdLogo}><Text style={styles.smallTdLogoText}>TD</Text></View>
              <Text style={styles.offersTitle}>TD for you</Text>
            </View>
            <Text style={styles.offerCount}>3 offers · swipe</Text>
          </View>
          <TouchableOpacity accessibilityRole="button" style={styles.offerCard}>
            <View style={styles.offerIcon}><Ionicons name="leaf-outline" size={22} color={palette.green} /></View>
            <View style={styles.offerCopy}>
              <Text style={styles.offerEyebrow}>MADE FOR MAYA</Text>
              <Text style={styles.offerTitle}>A little more room to grow</Text>
              <Text style={styles.offerDescription}>Explore ways to make your savings go further.</Text>
            </View>
            <Ionicons name="chevron-forward" size={17} color="rgba(22,25,23,0.58)" />
          </TouchableOpacity>

          <View style={styles.insightsHeading}>
            <View>
              <Text style={styles.insightsTitle}>Account insights</Text>
              <Text style={styles.insightsSubtitle}>A closer look at your money</Text>
            </View>
            <Text style={styles.insightsSwipe}>SWIPE <Ionicons name="arrow-forward" size={11} color={colors.textSecondary} /></Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={244}
            decelerationRate="fast"
            contentContainerStyle={styles.insightsRail}
            accessibilityLabel="Account insights, swipe horizontally to explore"
          >
            {accountInsights.map((insight) => (
              <View
                key={insight.id}
                accessible
                accessibilityRole="text"
                accessibilityLabel={`${insight.eyebrow}: ${insight.title}. ${insight.metric}. ${insight.detail}`}
                style={styles.insightCard}
              >
                <View style={styles.insightCardTop}>
                  <View style={styles.insightIcon}>
                    <Ionicons name={insight.icon} size={18} color={palette.greenDeep} />
                  </View>
                  <Text style={styles.insightEyebrow}>{insight.eyebrow}</Text>
                </View>
                <Text style={styles.insightMetric}>{insight.metric}</Text>
                <Text style={styles.insightTitle}>{insight.title}</Text>
                <Text style={styles.insightDetail}>{insight.detail}</Text>
              </View>
            ))}
          </ScrollView>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.background },
  hero: { minHeight: 286, position: 'relative', overflow: 'hidden' },
  heroImage: { width: '100%', height: '100%', zIndex: 0 },
  heroGradient: { zIndex: 1 },
  heroForeground: { zIndex: 2, paddingBottom: 30 },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
  },
  identity: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  tdLogo: { width: 42, height: 42, borderRadius: 10, backgroundColor: palette.green, alignItems: 'center', justifyContent: 'center' },
  tdLogoText: { color: colors.white, fontSize: 21, fontWeight: '800', letterSpacing: -1.5 },
  greeting: { color: 'rgba(255,255,255,0.72)', fontSize: 13, lineHeight: 18 },
  customerName: { color: colors.white, fontSize: 17, fontFamily: font.headline.bold, lineHeight: 22 },
  topActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  tediButton: { height: 44, paddingHorizontal: 9, borderRadius: 24, backgroundColor: palette.green, flexDirection: 'row', alignItems: 'center', gap: 7 },
  tediMark: { width: 30, height: 30, borderRadius: 16, backgroundColor: palette.ink, alignItems: 'center', justifyContent: 'center' },
  tediText: { color: palette.ink, fontSize: 14, fontWeight: '700', paddingRight: 5 },
  notificationButton: { width: 46, height: 46, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.13)', alignItems: 'center', justifyContent: 'center' },
  notificationCount: { position: 'absolute', right: -1, top: -3, width: 20, height: 20, borderRadius: 10, backgroundColor: colors.red, borderWidth: 1.5, borderColor: palette.greenDeep, alignItems: 'center', justifyContent: 'center' },
  notificationCountText: { color: colors.white, fontSize: 11, fontWeight: '700' },
  balanceBlock: { marginTop: 38, paddingHorizontal: 18 },
  balance: { color: colors.white, fontSize: 38, lineHeight: 46, fontFamily: font.headline.heavy, letterSpacing: -1.6, marginTop: 5 },
  content: { paddingHorizontal: 16, marginTop: -5 },
  sectionTitle: { color: palette.ink, fontSize: 18, fontFamily: font.headline.bold, marginBottom: 10 },
  feeNotice: { minHeight: 62, borderRadius: 16, backgroundColor: palette.ink, paddingHorizontal: 14, paddingVertical: 9, flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 11 },
  feeNoticeCopy: { flex: 1, minWidth: 0, gap: 2 },
  feeNoticeText: { color: colors.white, fontSize: 14, lineHeight: 19, fontWeight: '600' },
  feeNoticeSubtext: { color: 'rgba(255,255,255,0.72)', fontSize: 14, lineHeight: 19 },
  moveMoneyButton: { minHeight: 48, borderRadius: 14, backgroundColor: palette.green, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 },
  moveMoneyText: { flex: 1, color: palette.ink, fontSize: 14, fontWeight: '700', marginLeft: 10 },
  accountList: { backgroundColor: palette.surface, borderRadius: 19, overflow: 'hidden' },
  accountRow: { minHeight: 65, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, gap: 10 },
  accountDivider: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: 'rgba(22,25,23,0.16)' },
  accountMark: { width: 38, height: 34, borderRadius: 8, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  accountMarkLine: { width: 22, height: 3, borderRadius: 2, backgroundColor: 'rgba(22,25,23,0.3)', marginTop: 12 },
  accountCopy: { flex: 1, minWidth: 0 },
  accountName: { color: palette.ink, fontSize: 14, fontWeight: '600', lineHeight: 18 },
  accountDetail: { color: 'rgba(22,25,23,0.62)', fontSize: 11, lineHeight: 15 },
  accountNote: { color: colors.greenDeep, fontSize: 10, fontWeight: '600', lineHeight: 14 },
  accountAmount: { color: palette.ink, fontSize: 14, fontWeight: '700', maxWidth: 102, textAlign: 'right' },
  offersHeading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, marginBottom: 9 },
  offersTitleGroup: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  smallTdLogo: { width: 26, height: 26, borderRadius: 7, backgroundColor: palette.green, alignItems: 'center', justifyContent: 'center' },
  smallTdLogoText: { color: colors.white, fontSize: 13, fontWeight: '800', letterSpacing: -1 },
  offersTitle: { color: palette.ink, fontSize: 17, fontFamily: font.headline.bold },
  offerCount: { color: 'rgba(22,25,23,0.58)', fontSize: 11 },
  offerCard: { minHeight: 86, borderRadius: 17, backgroundColor: palette.surface, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 11, marginBottom: 6 },
  offerIcon: { width: 42, height: 42, borderRadius: 13, backgroundColor: colors.greenDim, alignItems: 'center', justifyContent: 'center' },
  offerCopy: { flex: 1 },
  offerEyebrow: { color: colors.greenDeep, fontSize: 9, fontWeight: '700', letterSpacing: 0.7 },
  offerTitle: { color: palette.ink, fontSize: 13, fontFamily: font.headline.bold, marginTop: 2 },
  offerDescription: { color: 'rgba(22,25,23,0.62)', fontSize: 11, lineHeight: 15, marginTop: 1 },
  insightsHeading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 17, marginBottom: 9 },
  insightsTitle: { color: palette.ink, fontSize: 17, fontFamily: font.headline.bold },
  insightsSubtitle: { color: colors.textSecondary, fontSize: 12, lineHeight: 17, marginTop: 1 },
  insightsSwipe: { color: colors.textSecondary, fontSize: 10, fontWeight: '700', letterSpacing: 0.6, paddingBottom: 2 },
  insightsRail: { gap: 10, paddingHorizontal: 12, paddingBottom: 4 },
  insightCard: { width: 234, minHeight: 178, borderRadius: 18, backgroundColor: palette.surface, borderWidth: 1, borderColor: 'rgba(22,25,23,0.08)', padding: 14 },
  insightCardTop: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  insightIcon: { width: 32, height: 32, borderRadius: 11, backgroundColor: colors.greenDim, alignItems: 'center', justifyContent: 'center' },
  insightEyebrow: { color: colors.greenDeep, fontSize: 10, fontWeight: '700', letterSpacing: 0.7 },
  insightMetric: { color: palette.ink, fontSize: 22, lineHeight: 27, fontFamily: font.headline.bold, marginTop: 9 },
  insightTitle: { color: palette.ink, fontSize: 14, lineHeight: 19, fontFamily: font.headline.semibold, marginTop: 1 },
  insightDetail: { color: colors.textSecondary, fontSize: 14, lineHeight: 19, marginTop: 5 },
  heroCompact: { minHeight: 200 },
  heroForegroundCompact: { paddingBottom: 16 },
  topBarCompact: { paddingHorizontal: 14 },
  identityCompact: { gap: 6 },
  tdLogoCompact: { width: 32, height: 32, borderRadius: 8 },
  tdLogoTextCompact: { fontSize: 17 },
  greetingCompact: { fontSize: 11, lineHeight: 15 },
  customerNameCompact: { fontSize: 15, lineHeight: 19 },
  topActionsCompact: { gap: 4 },
  tediButtonCompact: { height: 36, paddingHorizontal: 6, gap: 5 },
  tediMarkCompact: { width: 24, height: 24 },
  tediTextCompact: { fontSize: 12, paddingRight: 2 },
  notificationButtonCompact: { width: 34, height: 34 },
  balanceBlockCompact: { marginTop: 30, paddingHorizontal: 14 },
  balanceCompact: { fontSize: 32, lineHeight: 39, letterSpacing: -1.2, marginTop: 4 },
  contentCompact: { paddingHorizontal: 12 },
  sectionTitleCompact: { fontSize: 17, marginBottom: 6 },
  feeNoticeCompact: { minHeight: 64, paddingHorizontal: 12, gap: 9, marginBottom: 8, borderRadius: 14 },
  accountRowCompact: { minHeight: 50, paddingHorizontal: 9, gap: 7 },
  accountMarkCompact: { width: 30, height: 30, borderRadius: 7 },
  accountNameCompact: { fontSize: 13, lineHeight: 16 },
  accountDetailCompact: { fontSize: 10, lineHeight: 13 },
  accountNoteCompact: { fontSize: 10, lineHeight: 12 },
  accountAmountCompact: { fontSize: 12, maxWidth: 78, flexShrink: 0 },
  moveMoneyButtonCompact: { minHeight: 44, paddingHorizontal: 12, marginTop: 8 },
  moveMoneyTextCompact: { fontSize: 13, marginLeft: 8 },
});
