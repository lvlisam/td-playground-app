import React from 'react';
import { ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View, Platform, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, font, radius, spacing } from '../theme';

const benefits = [
  { icon: 'airplane-outline' as const, title: 'Travel with confidence', detail: 'Save on your next trip with TD Rewards', value: '2,400 pts' },
  { icon: 'leaf-outline' as const, title: 'Grow your savings', detail: 'Earn a little more on every dollar', value: '4.60% APY' },
  { icon: 'cafe-outline' as const, title: 'A treat on us', detail: 'Enjoy a local coffee this week', value: 'New' },
];

const opportunities = [
  { icon: 'trending-up-outline' as const, title: 'Start investing from $5', detail: 'Every dollar counts toward Premier' },
  { icon: 'business-outline' as const, title: 'Lock in a Step Rate CD', detail: 'Counts in full, up to 4.25% APY' },
  { icon: 'wallet-outline' as const, title: 'Grow your savings vaults', detail: 'Round-ups and salary sorter do it for you' },
];

export default function BenefitsScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const compact = width < 360;
  const topInset = Platform.OS === 'web' ? 24 : insets.top;
  const [activeTab, setActiveTab] = React.useState<'overview' | 'rewards'>('overview');

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.content, compact && styles.contentCompact, { paddingTop: topInset + spacing.md, paddingBottom: insets.bottom + 92 }]}>
        <View style={styles.header}>
          <View style={styles.headingCopy}>
            <Text style={styles.eyebrow}>Everything you hold with TD</Text>
            <Text style={[styles.title, compact && styles.titleCompact]}>Relationship benefits</Text>
          </View>
        </View>

        <View style={styles.segmentedControl}>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityState={{ selected: activeTab === 'overview' }}
            onPress={() => setActiveTab('overview')}
            style={[styles.segment, activeTab === 'overview' && styles.segmentActive]}
          >
            <Text style={[styles.segmentText, activeTab === 'overview' && styles.segmentTextActive]}>Overview</Text>
          </TouchableOpacity>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityState={{ selected: activeTab === 'rewards' }}
            onPress={() => setActiveTab('rewards')}
            style={[styles.segment, activeTab === 'rewards' && styles.segmentActive]}
          >
            <Text style={[styles.segmentText, activeTab === 'rewards' && styles.segmentTextActive]}>Rewards &amp; Offers</Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'overview' ? (
          <>
            <View style={[styles.tierCard, compact && styles.tierCardCompact]}>
              <View style={styles.tierMeta}>
                <View style={styles.selectBadge}>
                  <Ionicons name="ribbon-outline" size={14} color={colors.text} />
                  <Text style={styles.selectBadgeText}>SELECT</Text>
                </View>
                <Text style={styles.tierMetaText}>Your relationship tier</Text>
              </View>
              <Text style={[styles.tierHeadline, compact && styles.tierHeadlineCompact]}>You&apos;re Select.</Text>
              <Text style={[styles.tierTarget, compact && styles.tierTargetCompact]}>$36,708 to Premier.</Text>
              <Text style={styles.tierDescription}>Deposits, cards and lending all help deepen your relationship with TD.</Text>

              <View style={styles.tierProgress} accessibilityLabel="Relationship tier: Select. Premier is the next tier.">
                {['Member', 'Select', 'Premier', 'Wealth'].map((level, index) => (
                  <View key={level} style={styles.tierStep}>
                    <View style={styles.tierTrack}>
                      {index < 1 ? <View style={[styles.tierFill, styles.tierFillFull]} /> : null}
                      {index === 1 ? <View style={[styles.tierFill, styles.tierFillCurrent]} /> : null}
                    </View>
                    <Text style={[styles.tierLabel, index === 1 && styles.tierLabelActive]}>{level}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.unlockPanel}>
                <Text style={styles.unlockTitle}>UNLOCK PREMIER · ABOUT $173 MORE A YEAR</Text>
                {opportunities.map((opportunity, index) => (
                  <TouchableOpacity
                    key={opportunity.title}
                    accessibilityRole="button"
                    accessibilityLabel={`${opportunity.title}. ${opportunity.detail}`}
                    style={[styles.opportunityRow, index < opportunities.length - 1 && styles.opportunityDivider]}
                  >
                    <View style={styles.opportunityIcon}>
                      <Ionicons name={opportunity.icon} size={19} color={colors.greenDeep} />
                    </View>
                    <View style={styles.opportunityCopy}>
                      <Text style={styles.opportunityTitle}>{opportunity.title}</Text>
                      <Text style={styles.opportunityDetail}>{opportunity.detail}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={17} color={colors.textTertiary} />
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <Text style={styles.relationshipTitle}>One relationship, everything in it</Text>
            <View style={styles.balanceSummary}>
              <View style={styles.balanceValues}>
                <View style={styles.balanceMetric}>
                  <Text style={styles.balanceLabel}>You have</Text>
                  <Text numberOfLines={1} adjustsFontSizeToFit style={styles.balanceValue}>$60,062.17</Text>
                </View>
                <View style={styles.balanceMetric}>
                  <Text style={styles.balanceLabel}>You owe</Text>
                  <Text numberOfLines={1} adjustsFontSizeToFit style={styles.balanceValue}>$1,284.56</Text>
                </View>
                <View style={styles.balanceMetric}>
                  <Text style={styles.balanceLabel}>Net</Text>
                  <Text numberOfLines={1} adjustsFontSizeToFit style={styles.balanceValueNet}>$58,777.61</Text>
                </View>
              </View>
              <View style={styles.balanceMeter} accessibilityLabel="Relationship balance overview">
                <View style={[styles.balanceMeterSegment, styles.balanceMeterChecking]} />
                <View style={[styles.balanceMeterSegment, styles.balanceMeterSavings]} />
                <View style={[styles.balanceMeterSegment, styles.balanceMeterDebt]} />
              </View>
            </View>
          </>
        ) : (
          <>
            <View style={[styles.rewardsIntro, compact && styles.rewardsIntroCompact]}>
              <View>
                <Text style={styles.rewardsEyebrow}>YOUR TD REWARDS</Text>
                <Text style={styles.rewardsTitle}>Make more of every day.</Text>
              </View>
              <View style={styles.pointsBadge}>
                <Ionicons name="sparkles-outline" size={15} color={colors.greenDeep} />
                <Text style={styles.pointsText}>18,420 pts</Text>
              </View>
            </View>
            <View style={styles.list}>
              {benefits.map((benefit, index) => (
                <TouchableOpacity key={benefit.title} accessibilityRole="button" style={[styles.row, index < benefits.length - 1 && styles.divider]}>
                  <View style={styles.rowIcon}><Ionicons name={benefit.icon} size={20} color={colors.greenDeep} /></View>
                  <View style={styles.rowCopy}>
                    <Text numberOfLines={2} style={styles.rowTitle}>{benefit.title}</Text>
                    <Text numberOfLines={2} style={styles.rowDetail}>{benefit.detail}</Text>
                  </View>
                  <View style={styles.rowEnd}>
                    <Text style={styles.rowValue}>{benefit.value}</Text>
                    <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { paddingHorizontal: spacing.md },
  contentCompact: { paddingHorizontal: 12 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: spacing.md },
  headingCopy: { flex: 1, minWidth: 0 },
  eyebrow: { color: colors.textSecondary, fontSize: 14, lineHeight: 20 },
  title: { color: colors.text, fontSize: 24, lineHeight: 29, fontFamily: font.headline.bold, marginTop: 2 },
  titleCompact: { fontSize: 21, lineHeight: 26 },
  segmentedControl: { flexDirection: 'row', gap: 4, padding: 4, borderRadius: 18, backgroundColor: colors.surfaceHigh, marginBottom: spacing.md },
  segment: { flex: 1, minHeight: 46, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6, borderRadius: 14 },
  segmentActive: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.borderFaint },
  segmentText: { color: colors.textSecondary, fontSize: 14, fontWeight: font.weight.semibold, textAlign: 'center' },
  segmentTextActive: { color: colors.text },
  tierCard: { backgroundColor: colors.text, borderRadius: 20, padding: spacing.md, marginBottom: spacing.lg },
  tierCardCompact: { padding: 14 },
  tierMeta: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 },
  selectBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 7, borderRadius: radius.full, backgroundColor: colors.green },
  selectBadgeText: { color: colors.text, fontSize: 13, fontWeight: font.weight.bold, letterSpacing: 0.5 },
  tierMetaText: { color: 'rgba(255,255,255,0.7)', fontSize: 14 },
  tierHeadline: { color: colors.white, fontSize: 26, lineHeight: 32, fontFamily: font.headline.bold },
  tierHeadlineCompact: { fontSize: 24, lineHeight: 30 },
  tierTarget: { color: colors.white, fontSize: 24, lineHeight: 30, fontFamily: font.headline.bold },
  tierTargetCompact: { fontSize: 22, lineHeight: 28 },
  tierDescription: { color: 'rgba(255,255,255,0.72)', fontSize: 14, lineHeight: 21, marginTop: 8 },
  tierProgress: { flexDirection: 'row', gap: 7, marginTop: 20 },
  tierStep: { flex: 1, minWidth: 0, gap: 7 },
  tierTrack: { height: 8, overflow: 'hidden', borderRadius: radius.full, backgroundColor: 'rgba(255,255,255,0.16)' },
  tierFill: { height: '100%', borderRadius: radius.full, backgroundColor: colors.green },
  tierFillFull: { width: '100%' },
  tierFillCurrent: { width: '28%' },
  tierLabel: { color: 'rgba(255,255,255,0.58)', fontSize: 12, lineHeight: 16 },
  tierLabelActive: { color: colors.white, fontWeight: font.weight.semibold },
  unlockPanel: { padding: 14, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.1)', marginTop: 20 },
  unlockTitle: { color: colors.green, fontSize: 14, lineHeight: 20, fontWeight: font.weight.bold, letterSpacing: 0.3, marginBottom: 6 },
  opportunityRow: { minHeight: 68, flexDirection: 'row', alignItems: 'center', gap: 10 },
  opportunityDivider: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: 'rgba(255,255,255,0.14)' },
  opportunityIcon: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 11, backgroundColor: 'rgba(255,255,255,0.1)' },
  opportunityCopy: { flex: 1, minWidth: 0 },
  opportunityTitle: { color: colors.white, fontSize: 14, lineHeight: 19, fontWeight: font.weight.medium },
  opportunityDetail: { color: 'rgba(255,255,255,0.68)', fontSize: 14, lineHeight: 19, marginTop: 1 },
  relationshipTitle: { color: colors.text, fontSize: 17, lineHeight: 23, fontFamily: font.headline.bold, marginBottom: 10 },
  balanceSummary: { backgroundColor: colors.surface, borderRadius: 18, padding: 14, marginBottom: spacing.md },
  balanceValues: { flexDirection: 'row', gap: 8 },
  balanceMetric: { flex: 1, minWidth: 0, gap: 4 },
  balanceLabel: { color: colors.textSecondary, fontSize: 14, lineHeight: 19 },
  balanceValue: { color: colors.text, fontSize: 14, lineHeight: 19, fontFamily: font.headline.bold },
  balanceValueNet: { color: colors.greenDeep, fontSize: 14, lineHeight: 19, fontFamily: font.headline.bold },
  balanceMeter: { width: '100%', height: 9, flexDirection: 'row', gap: 2, overflow: 'hidden', borderRadius: radius.full, marginTop: 16 },
  balanceMeterSegment: { height: '100%' },
  balanceMeterChecking: { width: '11%', backgroundColor: colors.greenDeep },
  balanceMeterSavings: { width: '86%', backgroundColor: colors.green },
  balanceMeterDebt: { flex: 1, backgroundColor: colors.text },
  rewardsIntro: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: spacing.md },
  rewardsIntroCompact: { flexDirection: 'column', alignItems: 'flex-start', gap: 8 },
  rewardsEyebrow: { color: colors.greenDeep, fontSize: 14, lineHeight: 19, fontWeight: font.weight.bold },
  rewardsTitle: { color: colors.text, fontSize: 19, lineHeight: 25, fontFamily: font.headline.bold, marginTop: 3 },
  pointsBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 8, borderRadius: radius.full, backgroundColor: colors.greenDim },
  pointsText: { color: colors.text, fontSize: 14, fontWeight: font.weight.semibold },
  list: { backgroundColor: colors.surface, borderRadius: radius.lg, paddingHorizontal: spacing.md, borderWidth: 1, borderColor: colors.border },
  row: { minHeight: 84, flexDirection: 'row', alignItems: 'center', gap: 10 },
  divider: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  rowIcon: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: radius.md, backgroundColor: colors.greenDim },
  rowCopy: { flex: 1, minWidth: 0 },
  rowTitle: { color: colors.text, fontSize: 14, lineHeight: 19, fontFamily: font.headline.semibold },
  rowDetail: { color: colors.textSecondary, fontSize: 14, lineHeight: 19, marginTop: 2 },
  rowEnd: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  rowValue: { color: colors.textSecondary, fontSize: 14, fontWeight: font.weight.semibold },
});
