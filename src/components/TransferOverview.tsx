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
import TediMoveMoneyChat from './TediMoveMoneyChat';

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

const RECOMMENDED_ACTION_IDS: TransferAction[] = ['send', 'move', 'bills'];

const RECENT_MOVEMENTS = [
  { id: 'savings-transfer', title: 'Transfer to savings', subtitle: 'From Checking · Today, 9:14 AM', amount: '+$250.00', icon: 'swap-horizontal-outline' as const },
  { id: 'sarah-payment', title: 'Sent to Sarah M.', subtitle: 'Zelle · Yesterday, 4:22 PM', amount: '−$45.50', icon: 'paper-plane-outline' as const },
  { id: 'electric-payment', title: 'Con Edison', subtitle: 'Bill payment · Nov 12', amount: '−$118.42', icon: 'receipt-outline' as const },
];

export default function TransferOverview({ onSelectAction }: TransferOverviewProps) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const compact = width < 360;
  const previewTopInset = Platform.OS === 'web' ? (width < 650 ? 24 : 48) : insets.top;
  const [activityMode, setActivityMode] = useState<ActivityMode>('upcoming');
  const visibleBills = activityMode === 'upcoming' ? upcomingBillPayments : paidBillPayments;
  const recommendedActions = ACTIONS.filter((action) => RECOMMENDED_ACTION_IDS.includes(action.id));
  const otherActions = ACTIONS.filter((action) => !RECOMMENDED_ACTION_IDS.includes(action.id));

  const renderRecommendation = (action: ActionItem) => (
    <TouchableOpacity
      key={action.id}
      accessibilityRole="button"
      accessibilityLabel={`${action.title}. ${action.subtitle}`}
      onPress={() => onSelectAction(action.id)}
      style={[styles.recommendationCard, compact && styles.recommendationCardCompact]}
    >
      <View style={[styles.recommendationIcon, action.id === 'send' && styles.recommendationIconFeatured]}>
        <Ionicons name={action.icon} size={17} color={colors.greenDeep} />
      </View>
      <Text style={styles.recommendationTitle} numberOfLines={2}>{action.title}</Text>
      <Text style={styles.recommendationSubtitle} numberOfLines={2}>{action.subtitle}</Text>
    </TouchableOpacity>
  );

  const renderOtherAction = (action: ActionItem) => (
    <TouchableOpacity
      key={action.id}
      accessibilityRole="button"
      accessibilityLabel={`${action.title}. ${action.subtitle}`}
      onPress={() => onSelectAction(action.id)}
      style={[styles.actionCard, compact && styles.actionCardCompact]}
    >
      <View style={styles.actionIcon}>
        <Ionicons name={action.icon} size={17} color={colors.greenDeep} />
      </View>
      <Text style={styles.actionTitle} numberOfLines={2}>{action.title}</Text>
      <Text style={styles.actionSubtitle} numberOfLines={2}>{action.subtitle}</Text>
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
          <Text accessibilityRole="header" style={styles.title}>Move money</Text>
        </View>

        <TediMoveMoneyChat onSelectAction={onSelectAction} />

        <View style={styles.section}>
          <Text accessibilityRole="header" style={styles.sectionTitle}>Recommended for you</Text>
          <View style={styles.recommendationRow}>
            {recommendedActions.map(renderRecommendation)}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text accessibilityRole="header" style={styles.sectionTitle}>Recent money movement</Text>
            <Text style={styles.sectionMeta}>Latest activity</Text>
          </View>
          <View style={styles.movementList}>
            {RECENT_MOVEMENTS.map((movement, index) => (
              <View key={movement.id} style={[styles.movementRow, index === RECENT_MOVEMENTS.length - 1 && styles.lastMovementRow]}>
                <View style={styles.movementIcon} accessible={false}>
                  <Ionicons name={movement.icon} size={18} color={colors.greenDeep} />
                </View>
                <View style={styles.movementCopy}>
                  <Text style={styles.movementTitle} numberOfLines={1}>{movement.title}</Text>
                  <Text style={styles.movementSubtitle} numberOfLines={1}>{movement.subtitle}</Text>
                </View>
                <Text style={[styles.movementAmount, movement.amount.startsWith('+') && styles.movementAmountPositive]}>{movement.amount}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text accessibilityRole="header" style={styles.sectionTitle}>{activityMode === 'upcoming' ? 'Upcoming bills' : 'Paid recently'}</Text>
            <View style={styles.activityLabel}>
              <Ionicons name={activityMode === 'upcoming' ? 'calendar-outline' : 'time-outline'} size={15} color={colors.textSecondary} />
              <Text style={styles.activityLabelText}>{activityMode === 'upcoming' ? `${upcomingBillPayments.length} due soon` : 'Bill history'}</Text>
            </View>
          </View>
          <View style={styles.segmentedControl} accessibilityRole="tablist">
            <TouchableOpacity
              accessibilityRole="tab"
              accessibilityState={{ selected: activityMode === 'upcoming' }}
              onPress={() => setActivityMode('upcoming')}
              style={[styles.segment, activityMode === 'upcoming' && styles.segmentActive]}
            >
              <Text style={[styles.segmentText, activityMode === 'upcoming' && styles.segmentTextActive]}>Upcoming</Text>
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
                <View style={styles.billIcon} accessible={false}>
                  <Ionicons name="receipt-outline" size={18} color={colors.greenDeep} />
                </View>
                <View style={styles.billCopy}>
                  <Text style={styles.billMerchant} numberOfLines={1}>{bill.merchant}</Text>
                  <Text style={styles.billTiming}>{bill.timing}</Text>
                </View>
                <Text style={styles.billAmount}>{bill.amount}</Text>
              </View>
            ))}
          </View>
          <TouchableOpacity accessibilityRole="button" onPress={() => onSelectAction('bills')} style={styles.billsAction}>
            <Text style={styles.billsActionText}>Pay a bill</Text>
            <Ionicons name="arrow-forward" size={15} color={colors.greenDeep} />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text accessibilityRole="header" style={styles.sectionTitle}>More ways to move money</Text>
          <View style={styles.otherActionsRow}>{otherActions.map(renderOtherAction)}</View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { paddingHorizontal: spacing.md },
  header: { marginBottom: spacing.md },
  title: { color: colors.text, fontSize: 26, lineHeight: 32, letterSpacing: -0.8, fontFamily: font.headline.bold },
  section: { marginTop: spacing.lg },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm, marginBottom: spacing.sm },
  sectionTitle: { color: colors.text, fontSize: font.size.md, lineHeight: 21, fontFamily: font.headline.semibold },
  sectionMeta: { color: colors.textSecondary, fontSize: 10 },
  recommendationRow: { flexDirection: 'row', gap: spacing.xs },
  recommendationCard: { flex: 1, minWidth: 0, minHeight: 110, padding: spacing.sm, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, gap: 4 },
  recommendationCardCompact: { padding: 8, minHeight: 106 },
  recommendationIcon: { width: 30, height: 30, borderRadius: radius.sm, backgroundColor: colors.greenDim, alignItems: 'center', justifyContent: 'center' },
  recommendationIconFeatured: { backgroundColor: colors.green },
  recommendationTitle: { color: colors.text, fontSize: 11, lineHeight: 15, fontFamily: font.headline.semibold },
  recommendationSubtitle: { color: colors.textSecondary, fontSize: 9, lineHeight: 13 },
  movementList: { overflow: 'hidden', borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  movementRow: { flexDirection: 'row', alignItems: 'center', minHeight: 66, gap: spacing.sm, paddingHorizontal: spacing.sm, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  lastMovementRow: { borderBottomWidth: 0 },
  movementIcon: { width: 34, height: 34, borderRadius: radius.md, backgroundColor: colors.surfaceHigh, alignItems: 'center', justifyContent: 'center' },
  movementCopy: { flex: 1, minWidth: 0 },
  movementTitle: { color: colors.text, fontSize: 12, lineHeight: 17, fontFamily: font.headline.semibold },
  movementSubtitle: { color: colors.textSecondary, fontSize: 10, lineHeight: 15 },
  movementAmount: { color: colors.text, fontSize: 11, fontFamily: font.headline.semibold },
  movementAmountPositive: { color: colors.greenDeep },
  activityLabel: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  activityLabelText: { color: colors.textSecondary, fontSize: 10 },
  segmentedControl: { flexDirection: 'row', gap: 4, padding: 4, marginBottom: spacing.sm, backgroundColor: colors.surfaceHigh, borderRadius: radius.md },
  segment: { flex: 1, minHeight: 36, alignItems: 'center', justifyContent: 'center', borderRadius: radius.sm, paddingHorizontal: 4 },
  segmentActive: { backgroundColor: colors.surface },
  segmentText: { color: colors.textSecondary, fontSize: 10, fontFamily: font.headline.medium },
  segmentTextActive: { color: colors.text, fontFamily: font.headline.semibold },
  billList: { overflow: 'hidden', borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  billRow: { flexDirection: 'row', alignItems: 'center', minHeight: 64, gap: spacing.sm, paddingHorizontal: spacing.sm, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  lastBillRow: { borderBottomWidth: 0 },
  billIcon: { width: 34, height: 34, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surfaceHigh },
  billCopy: { flex: 1, minWidth: 0 },
  billMerchant: { color: colors.text, fontSize: 12, lineHeight: 17, fontFamily: font.headline.semibold },
  billTiming: { color: colors.textSecondary, fontSize: 10, lineHeight: 15 },
  billAmount: { color: colors.text, fontSize: 11, fontFamily: font.headline.semibold },
  billsAction: { minHeight: 42, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  billsActionText: { color: colors.greenDeep, fontSize: 12, fontFamily: font.headline.semibold },
  otherActionsRow: { flexDirection: 'row', gap: spacing.xs },
  actionCard: { flex: 1, minWidth: 0, minHeight: 94, padding: spacing.sm, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  actionCardCompact: { padding: 8, minHeight: 90 },
  actionIcon: { width: 30, height: 30, borderRadius: radius.sm, backgroundColor: colors.surfaceHigh, alignItems: 'center', justifyContent: 'center' },
  actionTitle: { color: colors.text, fontSize: 11, lineHeight: 15, fontFamily: font.headline.semibold, marginTop: 5 },
  actionSubtitle: { color: colors.textSecondary, fontSize: 9, lineHeight: 13 },
});
