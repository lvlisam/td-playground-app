import React, { useState } from 'react';
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
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, font, radius, spacing } from '../theme';
import { paidBillPayments, upcomingBillPayments } from '../financeData';

export type TransferAction = 'send' | 'wire' | 'deposit' | 'move' | 'bills' | 'exchange';
type ActivityMode = 'upcoming' | 'paid';

type ActionItem = {
  id: TransferAction;
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  featured?: boolean;
};

const ACTIONS: ActionItem[] = [
  { id: 'send', title: 'Send & request', subtitle: 'Send with Zelle', icon: 'paper-plane-outline', featured: true },
  { id: 'wire', title: 'Wire transfer', subtitle: 'Domestic & international', icon: 'business-outline' },
  { id: 'deposit', title: 'Deposit a check', subtitle: 'Snap a photo', icon: 'camera-outline' },
  { id: 'move', title: 'Move money', subtitle: 'Between your accounts', icon: 'swap-horizontal-outline' },
  { id: 'bills', title: 'Pay bills', subtitle: 'Payees & autopay', icon: 'receipt-outline' },
  { id: 'exchange', title: 'Exchange', subtitle: 'Currencies & wallets', icon: 'globe-outline' },
];

const ACTION_LABELS: Record<TransferAction, string> = {
  send: 'Send & request',
  wire: 'Wire transfer',
  deposit: 'Deposit a check',
  move: 'Move money',
  bills: 'Pay bills',
  exchange: 'Exchange',
};

type TransferOverviewProps = {
  onSelectAction: (action: TransferAction) => void;
};

export default function TransferOverview({ onSelectAction }: TransferOverviewProps) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const previewTopInset = Platform.OS === 'web' ? (width < 650 ? 24 : 48) : insets.top;
  const [activityMode, setActivityMode] = useState<ActivityMode>('upcoming');
  const visibleBills = activityMode === 'upcoming' ? upcomingBillPayments : paidBillPayments;

  const renderAction = (action: ActionItem) => (
    <TouchableOpacity
      key={action.id}
      accessibilityRole="button"
      accessibilityLabel={`${action.title}. ${action.subtitle}`}
      onPress={() => onSelectAction(action.id)}
      style={[styles.actionCard, action.featured && styles.featuredCard]}
    >
      <View style={[styles.actionIcon, action.featured && styles.featuredIcon]}>
        <Ionicons name={action.icon} size={18} color={action.featured ? colors.text : colors.greenDeep} />
      </View>
      <Text style={[styles.actionTitle, action.featured && styles.featuredText]} numberOfLines={1}>
        {action.title}
      </Text>
      <Text style={[styles.actionSubtitle, action.featured && styles.featuredSubtitle]} numberOfLines={1}>
        {action.subtitle}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingTop: previewTopInset + spacing.sm, paddingBottom: insets.bottom + 112 }]}
      >
        <View style={styles.header}>
          <View style={styles.headingCopy}>
            <Text style={styles.eyebrow}>Move money your way</Text>
            <Text style={styles.title}>Move money</Text>
          </View>
        </View>

        <View style={styles.actionRow}>
          {ACTIONS.slice(0, 2).map(renderAction)}
        </View>

        <View style={[styles.actionRow, styles.secondaryRow]}>
          {ACTIONS.slice(2, 4).map(renderAction)}
        </View>
        <View style={[styles.actionRow, styles.lastActionRow]}>
          {ACTIONS.slice(4).map(renderAction)}
        </View>

        <View style={styles.activitySection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{activityMode === 'upcoming' ? 'Coming up' : 'Paid recently'}</Text>
            <View style={styles.activityLabel}>
              <Ionicons name={activityMode === 'upcoming' ? 'calendar-outline' : 'time-outline'} size={15} color={colors.textSecondary} />
              <Text style={styles.activityLabelText}>{activityMode === 'upcoming' ? 'Bills' : 'History'}</Text>
            </View>
          </View>

          <View style={styles.segmentedControl} accessibilityRole="tablist">
            <TouchableOpacity
              accessibilityRole="tab"
              accessibilityState={{ selected: activityMode === 'upcoming' }}
              onPress={() => setActivityMode('upcoming')}
              style={[styles.segment, activityMode === 'upcoming' && styles.segmentActive]}
            >
              <Text style={[styles.segmentText, activityMode === 'upcoming' && styles.segmentTextActive]}>Coming up</Text>
            </TouchableOpacity>
            <TouchableOpacity
              accessibilityRole="tab"
              accessibilityState={{ selected: activityMode === 'paid' }}
              onPress={() => setActivityMode('paid')}
              style={[styles.segment, activityMode === 'paid' && styles.segmentActive]}
            >
              <Text style={[styles.segmentText, activityMode === 'paid' && styles.segmentTextActive]}>Paid recently</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.billList}>
            {visibleBills.map((bill, index) => (
              <View key={bill.id} style={[styles.billRow, index === visibleBills.length - 1 && styles.lastBillRow]}>
                <View style={styles.billIcon}>
                  <Ionicons name="receipt-outline" size={20} color={colors.greenDeep} />
                </View>
                <View style={styles.billCopy}>
                  <Text style={styles.billMerchant} numberOfLines={1}>{bill.merchant}</Text>
                  <Text style={styles.billTiming}>{bill.timing}</Text>
                </View>
                <Text style={styles.billAmount}>{bill.amount}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { paddingHorizontal: spacing.md },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  headingCopy: { flex: 1 },
  eyebrow: { color: colors.textSecondary, fontSize: font.size.sm, lineHeight: 19 },
  title: { color: colors.text, fontSize: 26, lineHeight: 32, letterSpacing: -0.8, fontFamily: font.headline.bold },
  actionRow: { flexDirection: 'row', justifyContent: 'space-between' },
  secondaryRow: { marginTop: spacing.xs },
  lastActionRow: { marginTop: spacing.xs },
  actionCard: {
    width: '48.5%',
    height: 90,
    padding: 8,
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
    justifyContent: 'center',
  },
  featuredCard: { backgroundColor: colors.text },
  actionIcon: {
    width: 32,
    height: 32,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featuredIcon: { backgroundColor: colors.green },
  actionTitle: { color: colors.text, fontSize: 15, lineHeight: 18, fontFamily: font.headline.semibold, marginTop: 6 },
  actionSubtitle: { color: colors.textSecondary, fontSize: font.size.sm, lineHeight: 17 },
  featuredText: { color: colors.surface },
  featuredSubtitle: { color: colors.surfaceHigh },
  activitySection: { marginTop: spacing.md },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.sm },
  sectionTitle: { color: colors.text, fontSize: font.size.lg, lineHeight: 24, fontFamily: font.headline.semibold },
  activityLabel: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  activityLabelText: { color: colors.textSecondary, fontSize: font.size.sm },
  segmentedControl: {
    flexDirection: 'row',
    gap: 4,
    padding: 4,
    marginBottom: spacing.sm,
    backgroundColor: colors.surfaceHigh,
    borderRadius: radius.md,
  },
  segment: { flex: 1, minHeight: 34, alignItems: 'center', justifyContent: 'center', borderRadius: radius.sm, paddingHorizontal: 4 },
  segmentActive: { backgroundColor: colors.surface },
  segmentText: { color: colors.textSecondary, fontSize: font.size.sm, fontFamily: font.headline.medium },
  segmentTextActive: { color: colors.text, fontFamily: font.headline.semibold },
  billList: { overflow: 'hidden', backgroundColor: colors.surface, borderRadius: radius.xl },
  billRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 72,
    gap: 10,
    paddingHorizontal: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  lastBillRow: { borderBottomWidth: 0 },
  billIcon: { width: 42, height: 42, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surfaceHigh },
  billCopy: { flex: 1, minWidth: 0 },
  billMerchant: { color: colors.text, fontSize: font.size.sm, fontFamily: font.headline.semibold },
  billTiming: { color: colors.textSecondary, fontSize: font.size.sm, lineHeight: 19 },
  billAmount: { color: colors.text, fontSize: font.size.md, fontFamily: font.headline.semibold },
});
