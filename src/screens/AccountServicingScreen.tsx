import React from 'react';
import { Platform, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { useNavigation, useRoute, type NavigationProp, type ParamListBase } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AccountNicknameEditor from '../components/AccountNicknameEditor';
import { useAccounts } from '../accounts';
import type { AccountId } from '../accounts';
import { colors, font, radius, spacing } from '../theme';
import ScreenBackButton from '../components/ScreenBackButton';

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

export default function AccountServicingScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const route = useRoute();
  const { accounts, renameAccount } = useAccounts();
  const { width } = useWindowDimensions();
  const compact = width < 360;
  const previewTopInset = Platform.OS === 'web' ? (width < 650 ? 24 : 48) : insets.top;
  const accountId = (route.params as { accountId?: AccountId } | undefined)?.accountId ?? 'checking';
  const account = accounts.find((candidate) => candidate.id === accountId) ?? accounts[0];
  const isSavings = account.id === 'savings';

  const detailRows = isSavings
    ? [
        { label: 'Account number', value: account.detail.split(' · ')[0] },
        { label: 'Account type', value: account.productLabel },
        { label: 'Interest rate', value: '4.60% APY' },
            ]
    : [
        { label: 'Account number', value: account.detail },
        { label: 'Account type', value: account.productLabel },
        { label: 'Monthly fee', value: 'Waived with direct deposit' },
        { label: 'Ownership', value: 'Personal' },
      ];
  const planRows = account.plan?.kind === 'savings-goal'
    ? [
        { label: 'Goal amount', value: `$${account.plan.targetAmount.toLocaleString('en-US')}` },
        { label: 'Saved toward goal', value: `$${account.plan.savedAmount.toLocaleString('en-US')}` },
        { label: 'Monthly contribution', value: `$${account.plan.monthlyContribution.toLocaleString('en-US')}` },
        { label: 'Target date', value: account.plan.targetDate },
      ]
    : account.plan?.kind === 'spending'
      ? [
          { label: 'Monthly spending plan', value: `$${account.plan.monthlyBudget.toLocaleString('en-US')}` },
          { label: 'Spent this month', value: `$${account.plan.spent.toLocaleString('en-US')}` },
          { label: 'Remaining in plan', value: `$${account.plan.remaining.toLocaleString('en-US')}` },
        ]
      : [];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 136 }}>
        <View style={[styles.header, compact && styles.headerCompact, { paddingTop: previewTopInset + spacing.sm }]}>
          <ScreenBackButton style={styles.backButton} />
          <Text style={styles.headerTitle}>Account servicing</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={[styles.accountCard, compact && styles.accountCardCompact]}>
          <View style={styles.accountHeading}>
            <View style={[styles.accountIcon, { backgroundColor: account.swatch }]}>
              <Ionicons name={isSavings ? 'leaf-outline' : 'wallet-outline'} size={20} color={account.id === 'card' ? colors.white : colors.greenDeep} />
            </View>
            <View style={styles.accountHeadingCopy}>
              <Text style={styles.productLabel}>{account.productLabel}</Text>
              <AccountNicknameEditor accountId={account.id} name={account.name} onSave={renameAccount} />
            </View>
          </View>
          <View style={styles.balanceBlock}>
            <Text style={styles.balanceLabel}>{account.amountLabel}</Text>
            <Text style={styles.balanceValue}>{account.amount}</Text>
          </View>
          {account.note ? <Text style={styles.accountNote}>{account.note}</Text> : null}
        </View>

        <View style={styles.actions}>
          <TouchableOpacity accessibilityRole="button" onPress={() => navigation.navigate('Pay & Transfer')} style={styles.primaryAction}>
            <Ionicons name="swap-horizontal" size={18} color={colors.white} />
            <Text style={styles.primaryActionText}>Move money</Text>
          </TouchableOpacity>
          {isSavings ? (
            <TouchableOpacity accessibilityRole="button" onPress={() => navigation.navigate('Plan')} style={styles.secondaryAction}>
              <Ionicons name="analytics-outline" size={18} color={colors.greenDeep} />
              <Text style={styles.secondaryActionText}>Savings plan</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account details</Text>
          <View style={styles.detailsCard}>
            {detailRows.map((row, index) => (
              <View key={row.label}>
                {index > 0 ? <View style={styles.divider} /> : null}
                <DetailRow label={row.label} value={row.value} />
              </View>
            ))}
          </View>
        </View>

        {planRows.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Plan details</Text>
            <View style={styles.detailsCard}>
              {planRows.map((row, index) => (
                <View key={row.label}>
                  {index > 0 ? <View style={styles.divider} /> : null}
                  <DetailRow label={row.label} value={row.value} />
                </View>
              ))}
            </View>
          </View>
        ) : null}

        <View style={styles.notice}>
          <Ionicons name="information-circle-outline" size={19} color={colors.greenDeep} />
          <Text style={styles.noticeText}>Account servicing actions shown here are a demo. Transfers and account changes are not submitted to a bank.</Text>
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
  accountCard: { marginHorizontal: spacing.md, padding: spacing.md, borderRadius: radius.xl, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, gap: spacing.md },
  accountCardCompact: { marginHorizontal: 12, padding: 14, gap: 12 },
  accountHeading: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  accountIcon: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: radius.md },
  accountHeadingCopy: { flex: 1, minWidth: 0, gap: 1 },
  productLabel: { color: colors.textSecondary, fontSize: font.size.xs, lineHeight: 16 },
  balanceBlock: { padding: spacing.md, borderRadius: radius.md, backgroundColor: colors.surfaceMid },
  balanceLabel: { color: colors.textSecondary, fontSize: font.size.xs },
  balanceValue: { color: colors.text, fontSize: font.size.xxl, lineHeight: 38, fontFamily: font.headline.bold },
  accountNote: { color: colors.greenDeep, fontSize: font.size.xs, fontFamily: font.body.medium },
  actions: { flexDirection: 'row', gap: spacing.sm, marginHorizontal: spacing.md, marginTop: spacing.md },
  primaryAction: { minHeight: 48, flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, borderRadius: radius.md, backgroundColor: colors.greenDeep },
  primaryActionText: { color: colors.white, fontSize: font.size.sm, fontFamily: font.body.medium },
  secondaryAction: { minHeight: 48, flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, borderRadius: radius.md, backgroundColor: colors.greenDim },
  secondaryActionText: { color: colors.greenDeep, fontSize: font.size.sm, fontFamily: font.body.medium },
  section: { marginTop: spacing.xl, paddingHorizontal: spacing.md },
  sectionTitle: { color: colors.text, fontSize: font.size.md, fontFamily: font.headline.semibold, marginBottom: spacing.sm },
  detailsCard: { paddingHorizontal: spacing.md, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  detailRow: { minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  detailLabel: { color: colors.textSecondary, fontSize: font.size.sm },
  detailValue: { flexShrink: 1, color: colors.text, fontSize: font.size.sm, fontFamily: font.body.medium, textAlign: 'right' },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: colors.borderFaint },
  notice: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm, marginHorizontal: spacing.md, marginTop: spacing.lg, padding: spacing.md, borderRadius: radius.md, backgroundColor: colors.greenDim },
  noticeText: { flex: 1, color: colors.textSecondary, fontSize: font.size.xs, lineHeight: 17 },
});
