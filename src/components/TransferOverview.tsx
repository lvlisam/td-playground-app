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
import TransactionBrandIcon from './TransactionBrandIcon';

export type TransferAction = 'send' | 'wire' | 'deposit' | 'move' | 'bills' | 'exchange' | 'help';
type ActivityMode = 'upcoming' | 'paid';

type ActionItem = {
  id: TransferAction;
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
};

const ACTIONS: ActionItem[] = [
  { id: 'move', title: 'Move between TD accounts', subtitle: 'Transfer money between your accounts', icon: 'swap-horizontal-outline' },
  { id: 'wire', title: 'Move to or from another bank', subtitle: 'Transfer money to an external account', icon: 'business-outline' },
  { id: 'send', title: 'Pay or request money from a person', subtitle: 'Send or request money with Zelle', icon: 'person-outline' },
  { id: 'bills', title: 'Pay a company or bill', subtitle: 'Pay a company, service, or bill', icon: 'receipt-outline' },
  { id: 'bills', title: 'Pay a loan or credit card', subtitle: 'Make a payment toward a loan or card', icon: 'card-outline' },
  { id: 'deposit', title: 'Deposit a check', subtitle: 'Deposit a check with your camera', icon: 'camera-outline' },
  { id: 'help', title: 'Not sure where to start', subtitle: 'Get help choosing the right option', icon: 'help-circle-outline' },
];

type TransferOverviewProps = {
  onSelectAction: (action: TransferAction) => void;
};

const LEARNED_PAYMENTS = upcomingBillPayments.flatMap((upcomingPayment) => {
  const previousPayment = paidBillPayments.find((payment) => payment.merchant === upcomingPayment.merchant);
  if (!previousPayment) return [];

  return [{
    id: upcomingPayment.id,
    merchant: upcomingPayment.merchant,
    previousTiming: previousPayment.timing,
    previousAmount: previousPayment.amount,
    nextTiming: upcomingPayment.timing,
  }];
});

export default function TransferOverview({ onSelectAction }: TransferOverviewProps) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const previewTopInset = Platform.OS === 'web' ? (width < 650 ? 24 : 48) : insets.top;
  const [activityMode, setActivityMode] = useState<ActivityMode>('upcoming');
  const visibleBills = activityMode === 'upcoming' ? upcomingBillPayments : paidBillPayments;

  const renderOtherAction = (action: ActionItem, index: number) => (
    <TouchableOpacity
      key={action.title}
      accessibilityRole="button"
      accessibilityLabel={`${action.title}. ${action.subtitle}`}
      onPress={() => onSelectAction(action.id)}
      style={[styles.actionCard, index === ACTIONS.length - 1 && styles.lastActionCard]}
    >
      {action.id === 'move' ? (
        <View style={[styles.actionIcon, styles.tdActionIcon]} accessible={false}>
          <Text style={styles.tdActionMark}>TD</Text>
        </View>
      ) : action.id === 'wire' ? (
        <View style={[styles.actionIcon, styles.externalActionIcon]} accessible={false}>
          <Ionicons name="business-outline" size={15} color={colors.teal} />
          <Text style={styles.externalActionMark}>EXT</Text>
        </View>
      ) : (
        <View style={styles.actionIcon} accessible={false}>
          <Ionicons name={action.icon} size={17} color={colors.greenDeep} />
        </View>
      )}
      <View style={styles.actionCopy}>
        <Text style={styles.actionTitle} numberOfLines={2}>{action.title}</Text>
        <Text style={styles.actionSubtitle} numberOfLines={2}>{action.subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} />
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
          <View style={styles.sectionHeader}>
            <View style={styles.learnedHeading}>
              <Text accessibilityRole="header" style={styles.sectionTitle}>Learned from your payments</Text>
              <Text style={styles.sectionMeta}>Based on your recent bill history</Text>
            </View>
            <View style={styles.learnedHeadingIcon} accessible={false}>
              <Ionicons name="sparkles-outline" size={17} color={colors.greenDeep} />
            </View>
          </View>
          <View style={styles.learnedCard}>
            <Text style={styles.learnedIntro}>These recent payments have another due date on the horizon.</Text>
            {LEARNED_PAYMENTS.map((payment, index) => (
              <View key={payment.id} style={[styles.learnedRow, index === LEARNED_PAYMENTS.length - 1 && styles.lastLearnedRow]}>
                <View style={styles.learnedIcon} accessible={false}>
                  <TransactionBrandIcon merchant={payment.merchant} fallbackIcon="receipt-outline" />
                </View>
                <View style={styles.learnedCopy}>
                  <Text style={styles.learnedMerchant} numberOfLines={1}>{payment.merchant}</Text>
                  <Text style={styles.learnedDetail} numberOfLines={1}>Last paid {payment.previousTiming.replace('Paid ', '')} · {payment.previousAmount}</Text>
                </View>
                <View style={styles.nextDue}>
                  <Text style={styles.nextDueLabel}>NEXT DUE</Text>
                  <Text style={styles.nextDueText}>{payment.nextTiming.replace('Due in ', '')}</Text>
                </View>
              </View>
            ))}
            <TouchableOpacity accessibilityRole="button" onPress={() => onSelectAction('bills')} style={styles.learnedAction}>
              <Text style={styles.learnedActionText}>Review upcoming bills</Text>
              <Ionicons name="arrow-forward" size={15} color={colors.greenDeep} />
            </TouchableOpacity>
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
                  <TransactionBrandIcon merchant={bill.merchant} fallbackIcon="receipt-outline" />
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
          <View style={styles.otherActionsList}>{ACTIONS.map(renderOtherAction)}</View>
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

  learnedHeading: { flex: 1, gap: 2 },
  learnedHeadingIcon: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center', borderRadius: radius.md, backgroundColor: colors.greenDim },
  learnedCard: { overflow: 'hidden', borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  learnedIntro: { paddingHorizontal: spacing.sm, paddingTop: spacing.sm, paddingBottom: spacing.xs, color: colors.textSecondary, fontSize: 10, lineHeight: 15 },
  learnedRow: { flexDirection: 'row', alignItems: 'center', minHeight: 64, gap: spacing.sm, paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  lastLearnedRow: { borderBottomWidth: 0 },
  learnedIcon: { width: 34, height: 34, borderRadius: radius.md, backgroundColor: colors.surfaceHigh, alignItems: 'center', justifyContent: 'center' },
  learnedCopy: { flex: 1, minWidth: 0 },
  learnedMerchant: { color: colors.text, fontSize: 12, lineHeight: 17, fontFamily: font.headline.semibold },
  learnedDetail: { color: colors.textSecondary, fontSize: 10, lineHeight: 15 },
  nextDue: { minWidth: 66, alignItems: 'flex-end', gap: 2 },
  nextDueLabel: { color: colors.greenDeep, fontSize: 8, lineHeight: 11, letterSpacing: 0.4, fontFamily: font.body.bold },
  nextDueText: { color: colors.text, fontSize: 10, lineHeight: 14, fontFamily: font.headline.semibold },
  learnedAction: { minHeight: 42, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
  learnedActionText: { color: colors.greenDeep, fontSize: 12, fontFamily: font.headline.semibold },
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
  otherActionsList: { overflow: 'hidden', borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  actionCard: { minHeight: 64, flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  lastActionCard: { borderBottomWidth: 0 },
  actionIcon: { width: 34, height: 34, borderRadius: radius.md, backgroundColor: colors.surfaceHigh, alignItems: 'center', justifyContent: 'center' },
  tdActionIcon: { backgroundColor: colors.greenDeep },
  tdActionMark: { color: colors.white, fontSize: 15, lineHeight: 18, fontFamily: font.headline.bold, letterSpacing: -0.5 },
  externalActionIcon: { backgroundColor: colors.blueDim, gap: 0 },
  externalActionMark: { color: colors.teal, fontSize: 6, lineHeight: 8, fontFamily: font.body.bold, letterSpacing: 0.3 },
  actionCopy: { flex: 1, minWidth: 0, gap: 2 },
  actionTitle: { color: colors.text, fontSize: 12, lineHeight: 17, fontFamily: font.headline.semibold },
  actionSubtitle: { color: colors.textSecondary, fontSize: 10, lineHeight: 14 },
});
