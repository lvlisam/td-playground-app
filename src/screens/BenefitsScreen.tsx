import React from 'react';
import { Platform, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { useNavigation, type NavigationProp, type ParamListBase } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, font, radius, spacing } from '../theme';
import ScreenBackButton from '../components/ScreenBackButton';
import { useAccounts } from '../accounts';
import { dashboardProfileOptions, useDashboardProfile } from '../personas';
import type { DashboardProfileId } from '../personas';

type RelationshipExample = {
  products: string[];
  peerProductCount: number;
  opportunity: string;
  opportunityDetail: string;
  strategy: { icon: keyof typeof Ionicons.glyphMap; title: string; detail: string }[];
};

const relationshipExamples: Record<DashboardProfileId, RelationshipExample> = {
  jane: {
    products: ['Everyday checking', 'Goal-based savings', 'TD Rewards card'],
    peerProductCount: 4,
    opportunity: 'Term savings',
    opportunityDetail: 'If part of your savings is for a later goal, compare a certificate of deposit with your timeline and access needs.',
    strategy: [
      { icon: 'repeat-outline', title: 'Keep your savings goal moving', detail: 'Your example plan adds $450 each month toward your getaway.' },
      { icon: 'business-outline', title: 'Compare a term option', detail: 'Explore whether setting aside a portion of goal savings fits your plans.' },
      { icon: 'card-outline', title: 'Make rewards work harder', detail: 'Use your TD Rewards card for eligible everyday purchases and review available offers.' },
    ],
  },
  james: {
    products: ['Personal checking', 'Growth savings', 'Cash rewards card'],
    peerProductCount: 4,
    opportunity: 'Term savings',
    opportunityDetail: 'A certificate of deposit may be worth comparing for savings you do not expect to need soon.',
    strategy: [
      { icon: 'wallet-outline', title: 'Build a savings rhythm', detail: 'Choose a recurring contribution that fits your monthly cash flow.' },
      { icon: 'business-outline', title: 'Compare a term option', detail: 'Match any fixed-term savings to a goal date and your need for access.' },
      { icon: 'card-outline', title: 'Review card benefits', detail: 'Check current rewards and offers before your next eligible purchase.' },
    ],
  },
  ava: {
    products: ['Everyday checking', 'Growth savings'],
    peerProductCount: 3,
    opportunity: 'Automated savings',
    opportunityDetail: 'A scheduled transfer can help separate everyday spending from savings for what is next.',
    strategy: [
      { icon: 'repeat-outline', title: 'Automate a small transfer', detail: 'Start with an amount that feels comfortable and adjust it as your plans change.' },
      { icon: 'flag-outline', title: 'Name your next milestone', detail: 'Connect savings to a near-term goal so progress is easier to track.' },
      { icon: 'gift-outline', title: 'Check your eligible offers', detail: 'Review account-specific rewards before opening or using another product.' },
    ],
  },
  olivia: {
    products: ['Youth checking', 'Youth savings'],
    peerProductCount: 2,
    opportunity: 'Savings goal tools',
    opportunityDetail: 'A named goal and regular allowance split can help turn everyday banking into a savings habit.',
    strategy: [
      { icon: 'repeat-outline', title: 'Set a simple savings routine', detail: 'Choose a small weekly amount to move toward a goal.' },
      { icon: 'flag-outline', title: 'Track progress together', detail: 'A shared goal can make saving feel more visible and achievable.' },
      { icon: 'shield-checkmark-outline', title: 'Keep the account mix age-fit', detail: 'Build healthy money habits before considering additional products.' },
    ],
  },
  noah: {
    products: ['Youth checking', 'Youth savings'],
    peerProductCount: 2,
    opportunity: 'Savings goal tools',
    opportunityDetail: 'A named goal and regular allowance split can help turn everyday banking into a savings habit.',
    strategy: [
      { icon: 'repeat-outline', title: 'Set a simple savings routine', detail: 'Choose a small weekly amount to move toward a goal.' },
      { icon: 'flag-outline', title: 'Track progress together', detail: 'A shared goal can make saving feel more visible and achievable.' },
      { icon: 'shield-checkmark-outline', title: 'Keep the account mix age-fit', detail: 'Build healthy money habits before considering additional products.' },
    ],
  },
  family: {
    products: ['Shared checking', 'Family savings', 'Rewards card', 'Youth banking'],
    peerProductCount: 5,
    opportunity: 'Term savings',
    opportunityDetail: 'For a family goal with a later date, compare a certificate of deposit and keep near-term funds accessible.',
    strategy: [
      { icon: 'people-outline', title: 'Keep family goals connected', detail: 'The example plan contributes $450 each month toward shared plans.' },
      { icon: 'business-outline', title: 'Compare a term option', detail: 'Consider only savings the family can leave untouched for the term.' },
      { icon: 'card-outline', title: 'Coordinate household rewards', detail: 'Use eligible offers on shared purchases and review who earns the points.' },
    ],
  },
  business: {
    products: ['Business checking', 'Business savings', 'Business credit card'],
    peerProductCount: 4,
    opportunity: 'Business term savings',
    opportunityDetail: 'A term deposit may suit a portion of reserves not needed for near-term operating expenses.',
    strategy: [
      { icon: 'swap-horizontal-outline', title: 'Keep operating cash accessible', detail: 'Review regular inflows and upcoming expenses before setting aside funds.' },
      { icon: 'business-outline', title: 'Compare a term option', detail: 'Match any fixed-term savings to your business cash-flow needs.' },
      { icon: 'card-outline', title: 'Use card offers intentionally', detail: 'Review eligible business rewards and offers against planned purchases.' },
    ],
  },
};

const pointsByProfile: Record<DashboardProfileId, string> = {
  jane: '18,420',
  james: '12,480',
  ava: '6,800',
  olivia: '1,240',
  noah: '890',
  family: '18,420',
  business: '24,600',
};

const offers = [
  {
    icon: 'airplane-outline' as const,
    eyebrow: 'TD REWARDS',
    title: 'Put your points toward a trip',
    detail: 'Explore travel and other ways to use your points.',
    badge: '18,420 pts',
  },
  {
    icon: 'cart-outline' as const,
    eyebrow: 'EVERYDAY OFFER',
    title: 'Earn more on eligible groceries',
    detail: 'Check the offer details and activation window before shopping.',
    badge: 'For you',
  },
  {
    icon: 'leaf-outline' as const,
    eyebrow: 'SAVINGS OFFER',
    title: 'See if a savings boost is available',
    detail: 'Review current rates and eligibility for your account.',
    badge: 'Explore',
  },
];

function SectionHeading({ eyebrow, title, detail }: { eyebrow?: string; title: string; detail?: string }) {
  return (
    <View style={styles.sectionHeading}>
      {eyebrow ? <Text style={styles.sectionEyebrow}>{eyebrow}</Text> : null}
      <Text accessibilityRole="header" style={styles.sectionTitle}>{title}</Text>
      {detail ? <Text style={styles.sectionDetail}>{detail}</Text> : null}
    </View>
  );
}

function RewardOfferCard({ offer }: { offer: typeof offers[number] }) {
  return (
    <View style={styles.offerCard}>
      <View style={styles.offerIcon}>
        <Ionicons name={offer.icon} size={20} color={colors.greenDeep} />
      </View>
      <View style={styles.offerCopy}>
        <Text style={styles.offerEyebrow}>{offer.eyebrow}</Text>
        <Text style={styles.offerTitle}>{offer.title}</Text>
        <Text style={styles.offerDetail}>{offer.detail}</Text>
      </View>
      <View style={styles.offerBadge}>
        <Text style={styles.offerBadgeText}>{offer.badge}</Text>
      </View>
    </View>
  );
}

export default function BenefitsScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const compact = width < 360;
  const topInset = Platform.OS === 'web' ? 24 : insets.top;
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const { activeProfileId, activeProfile } = useDashboardProfile();
  const { accounts } = useAccounts();
  const relationship = relationshipExamples[activeProfileId];
  const isHousehold = activeProfileId === 'family';
  const isBusiness = activeProfileId === 'business';
  const pointBalance = pointsByProfile[activeProfileId];
  const productCount = relationship.products.length;
  const progressWidth = `${Math.min(100, (productCount / relationship.peerProductCount) * 100)}%` as `${number}%`;
  const savingsGoal = activeProfileId === 'jane' ? accounts.find((account) => account.id === 'savings')?.plan : null;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, compact && styles.contentCompact, { paddingTop: topInset + spacing.md, paddingBottom: insets.bottom + 132 }]}
      >
        <View style={styles.header}>
          <ScreenBackButton />
          <Text style={[styles.title, compact && styles.titleCompact]}>Benefits</Text>
          <Text style={styles.subtitle}>Rewards you can use now, with a clearer view of what could come next.</Text>
          <View style={styles.profileChip}>
            <Ionicons name={activeProfile.icon} size={15} color={colors.greenDeep} />
            <Text style={styles.profileChipText}>For {activeProfile.name} · {activeProfile.tdRelationshipLength} with TD</Text>
          </View>
        </View>

        <View style={styles.rewardsHero}>
          <View style={styles.rewardsHeroTop}>
            <View style={styles.rewardsHeroCopy}>
              <Text style={styles.heroEyebrow}>YOUR TD REWARDS</Text>
              <Text style={styles.heroTitle}>A little more value, right now.</Text>
            </View>
            <View style={styles.sparkleBadge}>
              <Ionicons name="sparkles-outline" size={19} color={colors.greenDeep} />
            </View>
          </View>
          <View style={styles.pointsRow}>
            <View>
              <Text style={styles.pointsValue}>{pointBalance}</Text>
              <Text style={styles.pointsLabel}>points available</Text>
            </View>
            <View style={styles.offerCount}>
              <Text style={styles.offerCountValue}>3</Text>
              <Text style={styles.offerCountLabel}>offers to explore</Text>
            </View>
          </View>
          <Text style={styles.heroFootnote}>Illustrative demo balance. Check your account for actual rewards and eligibility.</Text>
        </View>

        <View style={styles.offersSection}>
          <SectionHeading
            eyebrow="START HERE"
            title="Rewards & offers"
            detail="Current examples selected for this customer profile."
          />
          <View style={styles.offerList}>
            {offers.map((offer) => <RewardOfferCard key={offer.eyebrow} offer={offer} />)}
          </View>
        </View>

        <View style={styles.relationshipSection}>
          <SectionHeading
            eyebrow="THE BIGGER PICTURE"
            title="How your TD relationship grows"
            detail="Products and the way you use them can work together around your goals."
          />
          <View style={styles.relationshipCard}>
            <View style={styles.relationshipCardHeading}>
              <View style={styles.relationshipIcon}>
                <Ionicons name="people-outline" size={19} color={colors.greenDeep} />
              </View>
              <View style={styles.relationshipCardCopy}>
                <Text style={styles.relationshipCardTitle}>{isHousehold ? 'Your household relationship' : isBusiness ? 'Your business relationship' : `${activeProfile.name}’s TD relationship`}</Text>
                <Text style={styles.relationshipCardSubtitle}>{activeProfile.tdRelationshipLength} with TD · {productCount} product categories in this example</Text>
              </View>
            </View>
            <View style={styles.productList}>
              {relationship.products.map((product, index) => (
                <View key={product} style={[styles.productRow, index < relationship.products.length - 1 && styles.productDivider]}>
                  <View style={styles.productCheck}>
                    <Ionicons name="checkmark" size={14} color={colors.greenDeep} />
                  </View>
                  <Text style={styles.productName}>{product}</Text>
                  <Text style={styles.productStatus}>IN YOUR MIX</Text>
                </View>
              ))}
            </View>
            <View style={styles.peerComparison}>
              <View style={styles.peerComparisonHeading}>
                <View style={styles.peerCopy}>
                  <Text style={styles.peerTitle}>Compared with similar TD customers</Text>
                  <Text style={styles.peerDetail}>Example benchmark: {relationship.peerProductCount} product categories</Text>
                </View>
                <Text style={styles.peerCount}>{productCount}/{relationship.peerProductCount}</Text>
              </View>
              <View
                style={styles.peerTrack}
                accessibilityRole="progressbar"
                accessibilityLabel={`Example relationship comparison: ${productCount} of ${relationship.peerProductCount} product categories`}
                accessibilityValue={{ min: 0, max: relationship.peerProductCount, now: Math.min(productCount, relationship.peerProductCount) }}
              >
                <View style={[styles.peerFill, { width: progressWidth }]} />
              </View>
              <Text style={styles.peerDisclaimer}>Illustrative demo comparison, not live customer or account data.</Text>
            </View>
          </View>
        </View>

        <View style={styles.opportunityCard}>
          <View style={styles.opportunityHeader}>
            <View style={styles.opportunityIcon}>
              <Ionicons name="compass-outline" size={19} color={colors.greenDeep} />
            </View>
            <View style={styles.opportunityCopy}>
              <Text style={styles.opportunityEyebrow}>ONE AREA TO EXPLORE</Text>
              <Text style={styles.opportunityTitle}>{relationship.opportunity}</Text>
            </View>
            <View style={styles.notInMixBadge}><Text style={styles.notInMixText}>Not in your mix</Text></View>
          </View>
          <Text style={styles.opportunityDetail}>{relationship.opportunityDetail}</Text>
        </View>

        <View style={styles.strategySection}>
          <SectionHeading
            eyebrow="MADE FOR YOUR NEXT STEP"
            title="A growth strategy that fits"
            detail="Build on what you already use. Explore only what supports your plans."
          />
          <View style={styles.strategyCard}>
            {relationship.strategy.map((step, index) => (
              <View key={step.title} style={[styles.strategyRow, index < relationship.strategy.length - 1 && styles.strategyDivider]}>
                <View style={styles.strategyIcon}>
                  <Ionicons name={step.icon} size={18} color={colors.greenDeep} />
                </View>
                <View style={styles.strategyCopy}>
                  <Text style={styles.strategyTitle}>{step.title}</Text>
                  <Text style={styles.strategyDetail}>{step.detail}</Text>
                </View>
                <Text style={styles.strategyNumber}>{String(index + 1).padStart(2, '0')}</Text>
              </View>
            ))}
            {savingsGoal?.kind === 'savings-goal' ? (
              <View style={styles.goalCallout}>
                <Ionicons name="flag-outline" size={16} color={colors.greenDeep} />
                <Text style={styles.goalCalloutText}>Current plan: ${savingsGoal.monthlyContribution} per month toward {accounts.find((account) => account.id === 'savings')?.name}.</Text>
              </View>
            ) : null}
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityHint="Opens your planning tools"
              onPress={() => navigation.navigate('Plan')}
              style={styles.strategyButton}
            >
              <Text style={styles.strategyButtonText}>Review your plan</Text>
              <Ionicons name="arrow-forward" size={17} color={colors.white} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.disclaimer}>
          <Ionicons name="information-circle-outline" size={16} color={colors.textSecondary} />
          <Text style={styles.disclaimerText}>Offers, product comparisons and balances on this screen are illustrative demo data. Product eligibility, rates and terms vary. Review official account details before making financial decisions.</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { paddingHorizontal: spacing.md, gap: spacing.lg },
  contentCompact: { paddingHorizontal: 12, gap: spacing.md },
  header: { gap: spacing.sm },
  title: { color: colors.text, fontSize: 27, lineHeight: 33, fontFamily: font.headline.bold, letterSpacing: -0.5 },
  titleCompact: { fontSize: 24, lineHeight: 30 },
  subtitle: { color: colors.textSecondary, fontSize: 14, lineHeight: 20 },
  profileChip: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 7, borderRadius: radius.full, backgroundColor: colors.greenDim },
  profileChipText: { color: colors.greenDeep, fontSize: 11, lineHeight: 15, fontFamily: font.body.medium },
  rewardsHero: { padding: spacing.md, borderRadius: radius.xl, backgroundColor: colors.greenDim, gap: 14 },
  rewardsHeroTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  rewardsHeroCopy: { flex: 1, gap: 3 },
  heroEyebrow: { color: colors.greenDeep, fontSize: 10, lineHeight: 14, fontFamily: font.body.bold, letterSpacing: 0.7 },
  heroTitle: { color: colors.text, fontSize: 19, lineHeight: 25, fontFamily: font.headline.bold },
  sparkleBadge: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center', borderRadius: radius.md, backgroundColor: colors.surface },
  pointsRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12 },
  pointsValue: { color: colors.text, fontSize: 30, lineHeight: 36, fontFamily: font.headline.bold, letterSpacing: -0.6 },
  pointsLabel: { color: colors.textSecondary, fontSize: 12, lineHeight: 17 },
  offerCount: { alignItems: 'flex-end', paddingBottom: 2 },
  offerCountValue: { color: colors.greenDeep, fontSize: 19, lineHeight: 23, fontFamily: font.headline.bold },
  offerCountLabel: { color: colors.textSecondary, fontSize: 10, lineHeight: 15 },
  heroFootnote: { color: colors.textSecondary, fontSize: 10, lineHeight: 15 },
  offersSection: { gap: 10 },
  sectionHeading: { gap: 3 },
  sectionEyebrow: { color: colors.greenDeep, fontSize: 9, lineHeight: 13, fontFamily: font.body.bold, letterSpacing: 0.8 },
  sectionTitle: { color: colors.text, fontSize: 19, lineHeight: 25, fontFamily: font.headline.bold },
  sectionDetail: { color: colors.textSecondary, fontSize: 12, lineHeight: 17 },
  offerList: { gap: 8 },
  offerCard: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  offerIcon: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center', borderRadius: radius.md, backgroundColor: colors.greenDim },
  offerCopy: { flex: 1, minWidth: 0, gap: 2 },
  offerEyebrow: { color: colors.greenDeep, fontSize: 8, lineHeight: 12, fontFamily: font.body.bold, letterSpacing: 0.7 },
  offerTitle: { color: colors.text, fontSize: 13, lineHeight: 17, fontFamily: font.headline.semibold },
  offerDetail: { color: colors.textSecondary, fontSize: 10, lineHeight: 14 },
  offerBadge: { alignSelf: 'flex-start', paddingHorizontal: 7, paddingVertical: 5, borderRadius: radius.full, backgroundColor: colors.surfaceMid },
  offerBadgeText: { color: colors.textSecondary, fontSize: 9, lineHeight: 12, fontFamily: font.body.medium },
  relationshipSection: { gap: 10 },
  relationshipCard: { padding: 14, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, gap: 13 },
  relationshipCardHeading: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  relationshipIcon: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center', borderRadius: radius.md, backgroundColor: colors.greenDim },
  relationshipCardCopy: { flex: 1, gap: 2 },
  relationshipCardTitle: { color: colors.text, fontSize: 15, lineHeight: 20, fontFamily: font.headline.bold },
  relationshipCardSubtitle: { color: colors.textSecondary, fontSize: 10, lineHeight: 15 },
  productList: { borderTopWidth: 1, borderTopColor: colors.border },
  productRow: { minHeight: 39, flexDirection: 'row', alignItems: 'center', gap: 8 },
  productDivider: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  productCheck: { width: 21, height: 21, alignItems: 'center', justifyContent: 'center', borderRadius: radius.full, backgroundColor: colors.greenDim },
  productName: { flex: 1, color: colors.text, fontSize: 11, lineHeight: 15, fontFamily: font.body.medium },
  productStatus: { color: colors.textTertiary, fontSize: 8, lineHeight: 12, fontFamily: font.body.bold, letterSpacing: 0.35 },
  peerComparison: { padding: 11, borderRadius: radius.md, backgroundColor: colors.surfaceMid, gap: 8 },
  peerComparisonHeading: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  peerCopy: { flex: 1, gap: 2 },
  peerTitle: { color: colors.text, fontSize: 11, lineHeight: 15, fontFamily: font.headline.semibold },
  peerDetail: { color: colors.textSecondary, fontSize: 9, lineHeight: 13 },
  peerCount: { color: colors.greenDeep, fontSize: 14, lineHeight: 18, fontFamily: font.headline.bold },
  peerTrack: { height: 7, overflow: 'hidden', borderRadius: radius.full, backgroundColor: colors.surfaceElevated },
  peerFill: { height: '100%', borderRadius: radius.full, backgroundColor: colors.greenDeep },
  peerDisclaimer: { color: colors.textTertiary, fontSize: 8, lineHeight: 12 },
  opportunityCard: { padding: 13, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, gap: 9 },
  opportunityHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  opportunityIcon: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center', borderRadius: radius.md, backgroundColor: colors.greenDim },
  opportunityCopy: { flex: 1, minWidth: 0, gap: 1 },
  opportunityEyebrow: { color: colors.greenDeep, fontSize: 8, lineHeight: 12, fontFamily: font.body.bold, letterSpacing: 0.7 },
  opportunityTitle: { color: colors.text, fontSize: 14, lineHeight: 19, fontFamily: font.headline.bold },
  notInMixBadge: { paddingHorizontal: 7, paddingVertical: 5, borderRadius: radius.full, backgroundColor: colors.yellowDim },
  notInMixText: { color: colors.text, fontSize: 8, lineHeight: 11, fontFamily: font.body.medium },
  opportunityDetail: { color: colors.textSecondary, fontSize: 11, lineHeight: 16 },
  strategySection: { gap: 10 },
  strategyCard: { padding: 13, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, gap: 2 },
  strategyRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 9, paddingVertical: 10 },
  strategyDivider: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  strategyIcon: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center', borderRadius: radius.md, backgroundColor: colors.greenDim },
  strategyCopy: { flex: 1, gap: 2 },
  strategyTitle: { color: colors.text, fontSize: 12, lineHeight: 17, fontFamily: font.headline.semibold },
  strategyDetail: { color: colors.textSecondary, fontSize: 10, lineHeight: 15 },
  strategyNumber: { color: colors.textTertiary, fontSize: 9, lineHeight: 14, fontFamily: font.body.bold },
  goalCallout: { flexDirection: 'row', alignItems: 'flex-start', gap: 7, padding: 9, borderRadius: radius.md, backgroundColor: colors.greenDim, marginTop: 5 },
  goalCalloutText: { flex: 1, color: colors.text, fontSize: 10, lineHeight: 15 },
  strategyButton: { minHeight: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingHorizontal: 14, borderRadius: radius.md, backgroundColor: colors.greenDeep, marginTop: 8 },
  strategyButtonText: { color: colors.white, fontSize: 12, lineHeight: 16, fontFamily: font.body.bold },
  disclaimer: { flexDirection: 'row', alignItems: 'flex-start', gap: 7, paddingHorizontal: 2 },
  disclaimerText: { flex: 1, color: colors.textSecondary, fontSize: 9, lineHeight: 14 },
});
