import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { upcomingBillPayments } from '../financeData';
import { colors, font, radius, spacing } from '../theme';

const CREDIT_SCORE = 742;
const SCORE_PROGRESS = `${Math.round(((CREDIT_SCORE - 300) / (850 - 300)) * 100)}%` as `${number}%`;

export default function CreditAndBillsSection({ compact }: { compact: boolean }) {
  return (
    <View style={[styles.section, compact && styles.sectionCompact]}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Credit score &amp; upcoming bills</Text>
        <Text style={styles.exampleLabel}>Example data</Text>
      </View>

      <View style={styles.scoreCard}>
        <View style={styles.scoreHeader}>
          <View style={styles.scoreIcon}>
            <Ionicons name="speedometer-outline" size={19} color={colors.greenDeep} />
          </View>
          <View style={styles.scoreCopy}>
            <Text style={styles.cardTitle}>Credit score</Text>
            <Text style={styles.scoreDescriptor}>Very good · updated Nov 14</Text>
          </View>
          <Text style={styles.scoreValue}>{CREDIT_SCORE}</Text>
        </View>
        <View accessible accessibilityLabel={`Credit score ${CREDIT_SCORE} out of 850`} style={styles.scoreTrack}>
          <View style={[styles.scoreFill, { width: SCORE_PROGRESS }]} />
        </View>
        <View style={styles.scoreRange}>
          <Text style={styles.rangeLabel}>300</Text>
          <Text style={styles.rangeLabel}>850</Text>
        </View>
      </View>

      <View style={styles.billsCard}>
        <View style={styles.billsHeader}>
          <View style={styles.billsTitleGroup}>
            <View style={styles.billsIcon}>
              <Ionicons name="calendar-outline" size={18} color={colors.greenDeep} />
            </View>
            <Text style={styles.cardTitle}>Upcoming bill payments</Text>
          </View>
          <Text style={styles.billCount}>{upcomingBillPayments.length} scheduled</Text>
        </View>
        {upcomingBillPayments.map((bill, index) => (
          <View key={bill.id} style={[styles.billRow, index === upcomingBillPayments.length - 1 && styles.lastBillRow]}>
            <View style={styles.billCopy}>
              <Text numberOfLines={1} style={styles.billMerchant}>{bill.merchant}</Text>
              <Text style={styles.billTiming}>{bill.timing}</Text>
            </View>
            <Text style={styles.billAmount}>{bill.amount}</Text>
          </View>
        ))}
      </View>
      <Text style={styles.disclaimer}>Illustrative credit and payment information; not connected to a credit bureau or biller.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginHorizontal: spacing.md, marginBottom: spacing.md, gap: spacing.sm },
  sectionCompact: { marginHorizontal: 12 },
  sectionHeader: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: spacing.sm },
  sectionTitle: { flex: 1, color: colors.text, fontSize: font.size.md, lineHeight: 21, fontFamily: font.headline.bold },
  exampleLabel: { color: colors.textSecondary, fontSize: 10, lineHeight: 14 },
  scoreCard: { padding: spacing.md, borderRadius: radius.lg, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.borderFaint, gap: spacing.sm },
  scoreHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  scoreIcon: { width: 38, height: 38, borderRadius: radius.md, backgroundColor: colors.greenDim, alignItems: 'center', justifyContent: 'center' },
  scoreCopy: { flex: 1, minWidth: 0, gap: 2 },
  cardTitle: { color: colors.text, fontSize: font.size.sm, lineHeight: 19, fontFamily: font.headline.semibold },
  scoreDescriptor: { color: colors.textSecondary, fontSize: font.size.xs, lineHeight: 16 },
  scoreValue: { color: colors.greenDeep, fontSize: 24, lineHeight: 30, fontFamily: font.headline.bold },
  scoreTrack: { height: 8, overflow: 'hidden', borderRadius: radius.full, backgroundColor: colors.surfaceHigh },
  scoreFill: { height: '100%', borderRadius: radius.full, backgroundColor: colors.green },
  scoreRange: { flexDirection: 'row', justifyContent: 'space-between' },
  rangeLabel: { color: colors.textTertiary, fontSize: 10, lineHeight: 14 },
  billsCard: { paddingHorizontal: spacing.md, paddingTop: spacing.sm, borderRadius: radius.lg, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.borderFaint },
  billsHeader: { minHeight: 38, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm, paddingBottom: spacing.xs },
  billsTitleGroup: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flex: 1 },
  billsIcon: { width: 32, height: 32, borderRadius: radius.md, backgroundColor: colors.greenDim, alignItems: 'center', justifyContent: 'center' },
  billCount: { color: colors.textSecondary, fontSize: 10, lineHeight: 14 },
  billRow: { minHeight: 57, flexDirection: 'row', alignItems: 'center', gap: spacing.sm, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.borderFaint },
  lastBillRow: { borderBottomWidth: 0 },
  billCopy: { flex: 1, minWidth: 0, gap: 2 },
  billMerchant: { color: colors.text, fontSize: font.size.sm, lineHeight: 18, fontFamily: font.headline.medium },
  billTiming: { color: colors.textSecondary, fontSize: font.size.xs, lineHeight: 16 },
  billAmount: { color: colors.text, fontSize: font.size.sm, lineHeight: 18, fontFamily: font.headline.semibold },
  disclaimer: { color: colors.textSecondary, fontSize: 10, lineHeight: 14 },
});
