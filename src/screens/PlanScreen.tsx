import React from 'react';
import { Platform, ScrollView, StatusBar, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, font, radius, spacing } from '../theme';
import FamilyPlanBuilder from '../components/FamilyPlanBuilder';
import AccountPlanCard from '../components/AccountPlanCard';
import { useAccounts } from '../accounts';

function SavingsMomentumCard() {
  return (
    <View style={styles.momentumCard}>
      <View style={styles.momentumHeading}>
        <View style={styles.momentumIcon}>
          <Ionicons name="trending-up-outline" size={18} color={colors.greenDeep} />
        </View>
        <View style={styles.momentumCopy}>
          <Text style={styles.momentumEyebrow}>SAVINGS MOMENTUM</Text>
          <Text style={styles.momentumTitle}>A little more room to grow</Text>
        </View>
        <Text style={styles.momentumPeriod}>NOV</Text>
      </View>
      <View style={styles.momentumValues}>
        <View>
          <Text style={styles.momentumAmount}>+$240</Text>
          <Text style={styles.momentumLabel}>saved this month</Text>
        </View>
        <Ionicons name="arrow-forward" size={17} color={colors.textTertiary} />
        <View>
          <Text style={styles.momentumCompare}>+$180</Text>
          <Text style={styles.momentumLabel}>saved in October</Text>
        </View>
        <View style={styles.momentumChange}>
          <Text style={styles.momentumChangeText}>+$60</Text>
        </View>
      </View>
      <Text style={styles.momentumFootnote}>Example data: savings increased month over month.</Text>
    </View>
  );
}

export default function PlanScreen() {
  const { accounts } = useAccounts();
  const plannedAccounts = accounts.filter((account) => account.plan);
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const compact = width < 360;
  const previewTopInset = Platform.OS === 'web' ? (width < 650 ? 24 : 48) : insets.top;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, compact && styles.contentCompact, { paddingTop: previewTopInset + spacing.md, paddingBottom: insets.bottom + 100 }]}
      >
        <View style={styles.header}>
          <View style={styles.headerEyebrow}>
            <Ionicons name="leaf-outline" size={15} color={colors.greenDeep} />
            <Text style={styles.headerEyebrowText}>LIFE &amp; FAMILY PLANNING</Text>
          </View>
          <Text style={[styles.title, compact && styles.titleCompact]}>Your future, one step at a time.</Text>
          <Text style={styles.subtitle}>Start with a goal, then add context as life changes for more relevant next steps.</Text>
        </View>

        <SavingsMomentumCard />
        <View style={styles.sectionHeading}>
          <Text style={styles.sectionTitle}>Account plans</Text>
          <Text style={styles.sectionSubtitle}>A simple view of your savings goal and monthly spending.</Text>
        </View>
        <View style={styles.accountPlans}>
          {plannedAccounts.map((account) => <AccountPlanCard key={account.id} account={account} />)}
        </View>
        <View style={styles.sectionHeading}>
          <Text style={styles.sectionTitle}>Plan for what&apos;s next</Text>
          <Text style={styles.sectionSubtitle}>Your accounts are a starting point. Add optional details for advice that better fits your priorities.</Text>
        </View>
        <FamilyPlanBuilder />
        <View style={styles.disclaimer}>
          <Ionicons name="information-circle-outline" size={16} color={colors.textSecondary} />
          <Text style={styles.disclaimerText}>Plans use the example values shown above. Review assumptions with a qualified professional before making financial decisions.</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { paddingHorizontal: spacing.md, gap: spacing.md },
  contentCompact: { paddingHorizontal: 14, gap: 12 },
  header: { gap: spacing.sm },
  headerEyebrow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  headerEyebrowText: { color: colors.greenDeep, fontSize: 10, lineHeight: 14, fontWeight: '700', letterSpacing: 0.8 },
  title: { color: colors.text, fontSize: 27, lineHeight: 33, fontFamily: font.headline.bold, letterSpacing: -0.6 },
  titleCompact: { fontSize: 24, lineHeight: 30 },
  subtitle: { color: colors.textSecondary, fontSize: 14, lineHeight: 20 },
  momentumCard: { padding: 14, borderRadius: radius.xl, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.borderFaint, gap: 12 },
  momentumHeading: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  momentumIcon: { width: 36, height: 36, borderRadius: 12, backgroundColor: colors.greenDim, alignItems: 'center', justifyContent: 'center' },
  momentumCopy: { flex: 1, minWidth: 0, gap: 1 },
  momentumEyebrow: { color: colors.greenDeep, fontSize: 9, lineHeight: 13, fontWeight: '700', letterSpacing: 0.7 },
  momentumTitle: { color: colors.text, fontSize: 14, lineHeight: 19, fontFamily: font.headline.semibold },
  momentumPeriod: { color: colors.textSecondary, fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
  momentumValues: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 6 },
  momentumAmount: { color: colors.greenDeep, fontSize: 20, lineHeight: 25, fontFamily: font.headline.bold },
  momentumCompare: { color: colors.text, fontSize: 17, lineHeight: 25, fontFamily: font.headline.semibold },
  momentumLabel: { color: colors.textSecondary, fontSize: 10, lineHeight: 14 },
  momentumChange: { paddingHorizontal: 9, paddingVertical: 5, borderRadius: radius.full, backgroundColor: colors.greenDim },
  momentumChangeText: { color: colors.greenDeep, fontSize: 11, fontWeight: '700' },
  momentumFootnote: { color: colors.textSecondary, fontSize: 10, lineHeight: 15 },
  accountPlans: { gap: spacing.sm },
  sectionHeading: { gap: 2, marginTop: 2 },
  sectionTitle: { color: colors.text, fontSize: 18, lineHeight: 24, fontFamily: font.headline.bold },
  sectionSubtitle: { color: colors.textSecondary, fontSize: 12, lineHeight: 17 },
  disclaimer: { flexDirection: 'row', alignItems: 'flex-start', gap: 7, paddingHorizontal: 2 },
  disclaimerText: { flex: 1, color: colors.textSecondary, fontSize: 10, lineHeight: 15 },
});
