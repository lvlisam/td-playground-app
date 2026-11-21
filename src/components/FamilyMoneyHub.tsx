import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { DashboardProfileId } from '../personas';
import { colors, font, radius, spacing } from '../theme';

type ChildId = 'olivia' | 'noah';
type Chore = { id: string; title: string; detail: string };
type ChildProfile = {
  id: ChildId;
  name: string;
  initials: string;
  allowance: number;
  goal: string;
  goalDetail: string;
  goalProgress: number;
  goalIcon: 'headset-outline' | 'football-outline';
  chores: Chore[];
  reminders: string[];
};

const children: ChildProfile[] = [
  {
    id: 'olivia',
    name: 'Olivia',
    initials: 'OL',
    allowance: 25,
    goal: 'Save for headphones',
    goalDetail: '$180 saved of $300',
    goalProgress: 60,
    goalIcon: 'headset-outline',
    chores: [
      { id: 'room', title: 'Tidy bedroom', detail: 'Before Sunday evening' },
      { id: 'pet', title: 'Feed Luna', detail: 'Each evening' },
      { id: 'recycling', title: 'Sort recycling', detail: 'Before Friday' },
    ],
    reminders: ['Allowance review on Friday', 'Check your savings after allowance'],
  },
  {
    id: 'noah',
    name: 'Noah',
    initials: 'NH',
    allowance: 20,
    goal: 'Save for soccer cleats',
    goalDetail: '$75 saved of $120',
    goalProgress: 63,
    goalIcon: 'football-outline',
    chores: [
      { id: 'table', title: 'Set the table', detail: 'Before dinner' },
      { id: 'sports', title: 'Pack sports bag', detail: 'Before practice' },
      { id: 'laundry', title: 'Put laundry away', detail: 'Before Friday' },
    ],
    reminders: ['Allowance review on Friday', 'Bring your library book tomorrow'],
  },
];

function currency(amount: number) {
  return `$${amount}`;
}

const sharedFamilyGoals = [
  {
    id: 'home',
    title: 'Family home',
    description: 'A place to put down roots',
    saved: 28000,
    target: 50000,
    monthlyContribution: 300,
    icon: 'home-outline',
  },
  {
    id: 'travel',
    title: 'Family getaway',
    description: 'Make room for a shared adventure',
    saved: 13500,
    target: 20000,
    monthlyContribution: 150,
    icon: 'airplane-outline',
  },
] as const;

function formatGoalCurrency(amount: number) {
  return `$${amount.toLocaleString('en-US')}`;
}

function FamilyGoalsCard() {
  const totalSaved = sharedFamilyGoals.reduce((total, goal) => total + goal.saved, 0);
  const monthlyPlan = sharedFamilyGoals.reduce((total, goal) => total + goal.monthlyContribution, 0);

  return (
    <View style={styles.goalsCard}>
      <View style={styles.goalsHeader}>
        <View style={styles.goalsIcon}><Ionicons name="flag-outline" size={18} color={colors.greenDeep} /></View>
        <View style={styles.goalsHeaderCopy}>
          <Text style={styles.goalsEyebrow}>SHARED FAMILY GOALS</Text>
          <Text style={styles.goalsTitle}>Building toward what&apos;s next</Text>
          <Text style={styles.goalsSubtitle}>A simple monthly plan for the goals you share.</Text>
        </View>
      </View>

      <View style={styles.goalsSummary}>
        <View style={styles.goalsSummaryMetric}>
          <Text style={styles.goalsSummaryLabel}>TOTAL SAVED</Text>
          <Text style={styles.goalsSummaryValue}>{formatGoalCurrency(totalSaved)}</Text>
        </View>
        <View style={styles.goalsSummaryDivider} />
        <View style={styles.goalsSummaryMetric}>
          <Text style={styles.goalsSummaryLabel}>MONTHLY PLAN</Text>
          <Text style={styles.goalsSummaryValue}>{formatGoalCurrency(monthlyPlan)}<Text style={styles.goalsSummarySuffix}> / month</Text></Text>
        </View>
      </View>

      <View style={styles.sharedGoalsList}>
        {sharedFamilyGoals.map((goal) => {
          const progress = Math.round((goal.saved / goal.target) * 100);
          return (
            <View key={goal.id} style={styles.sharedGoal}>
              <View style={styles.sharedGoalTop}>
                <View style={styles.sharedGoalIdentity}>
                  <Ionicons name={goal.icon} size={16} color={colors.greenDeep} />
                  <View style={styles.sharedGoalCopy}>
                    <Text style={styles.sharedGoalTitle}>{goal.title}</Text>
                    <Text style={styles.sharedGoalDescription}>{goal.description}</Text>
                  </View>
                </View>
                <Text style={styles.sharedGoalProgress}>{progress}%</Text>
              </View>
              <View accessibilityLabel={`${goal.title}: ${progress}% saved`} style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${progress}%` }]} />
              </View>
              <View style={styles.sharedGoalDetails}>
                <Text style={styles.sharedGoalDetail}>{formatGoalCurrency(goal.saved)} of {formatGoalCurrency(goal.target)}</Text>
                <Text style={styles.sharedGoalDetail}>{formatGoalCurrency(goal.monthlyContribution)} / month</Text>
              </View>
            </View>
          );
        })}
      </View>
      <Text style={styles.goalsFootnote}>Example planning figures. Adjust targets to fit your family&apos;s priorities.</Text>
    </View>
  );
}

function ChoreChecklist({
  child,
  completed,
  onToggle,
  compact = false,
}: {
  child: ChildProfile;
  completed: string[];
  onToggle: (childId: ChildId, choreId: string) => void;
  compact?: boolean;
}) {
  return (
    <View style={[styles.choreList, compact && styles.choreListCompact]}>
      {child.chores.map((chore) => {
        const isComplete = completed.includes(chore.id);
        return (
          <TouchableOpacity
            key={chore.id}
            accessibilityRole="checkbox"
            accessibilityLabel={`${chore.title}, ${chore.detail}`}
            accessibilityState={{ checked: isComplete }}
            onPress={() => onToggle(child.id, chore.id)}
            style={[styles.choreRow, compact && styles.choreRowCompact]}
          >
            <View style={[styles.choreCheck, isComplete && styles.choreCheckComplete]}>
              {isComplete ? <Ionicons name="checkmark" size={13} color={colors.white} /> : null}
            </View>
            <View style={styles.choreCopy}>
              <Text style={[styles.choreTitle, isComplete && styles.choreTitleComplete]}>{chore.title}</Text>
              <Text style={styles.choreDetail}>{chore.detail}</Text>
            </View>
            <Text style={[styles.choreStatus, isComplete && styles.choreStatusComplete]}>{isComplete ? 'Done' : 'To do'}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function AllowanceProgress({ child, completedCount }: { child: ChildProfile; completedCount: number }) {
  const allComplete = completedCount === child.chores.length;
  const percentage = Math.round((completedCount / child.chores.length) * 100);

  return (
    <View style={styles.allowanceCard}>
      <View style={styles.allowanceTopline}>
        <View style={styles.allowanceIcon}>
          <Ionicons name="wallet-outline" size={17} color={colors.greenDeep} />
        </View>
        <View style={styles.allowanceCopy}>
          <Text style={styles.allowanceLabel}>WEEKLY ALLOWANCE</Text>
          <Text style={styles.allowanceAmount}>{currency(child.allowance)}</Text>
        </View>
        <View style={[styles.allowanceBadge, allComplete ? styles.allowanceBadgeReady : styles.allowanceBadgePending]}>
          <Text style={[styles.allowanceBadgeText, allComplete ? styles.allowanceBadgeTextReady : styles.allowanceBadgeTextPending]}>
            {allComplete ? 'Ready for review' : `${child.chores.length - completedCount} left`}
          </Text>
        </View>
      </View>
      <View accessibilityLabel={`${completedCount} of ${child.chores.length} chores complete`} style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${percentage}%` }]} />
      </View>
      <Text style={styles.allowanceHint}>
        {allComplete ? 'All chores are checked off. An adult can review the allowance.' : `${completedCount} of ${child.chores.length} chores complete before allowance review.`}
      </Text>
    </View>
  );
}

function ParentChildCard({
  child,
  completed,
  onToggle,
}: {
  child: ChildProfile;
  completed: string[];
  onToggle: (childId: ChildId, choreId: string) => void;
}) {
  const doneCount = child.chores.filter((chore) => completed.includes(chore.id)).length;
  const outstanding = child.chores.length - doneCount;

  return (
    <View style={styles.parentChildCard}>
      <View style={styles.childHeader}>
        <View style={styles.childAvatar}><Text style={styles.childAvatarText}>{child.initials}</Text></View>
        <View style={styles.childHeaderCopy}>
          <Text style={styles.childName}>{child.name}</Text>
          <Text style={styles.childMeta}>{doneCount} of {child.chores.length} chores complete</Text>
        </View>
        <Text style={styles.parentAllowanceAmount}>{currency(child.allowance)}<Text style={styles.parentAllowanceSuffix}> / week</Text></Text>
      </View>
      <AllowanceProgress child={child} completedCount={doneCount} />
      <Text style={styles.sectionLabel}>RESPONSIBILITIES</Text>
      <ChoreChecklist child={child} completed={completed} onToggle={onToggle} compact />
      <View style={styles.goalMiniRow}>
        <Ionicons name="trophy-outline" size={15} color={colors.greenDeep} />
        <Text style={styles.goalMiniText}>{child.goal} · {child.goalProgress}% saved</Text>
      </View>
      {outstanding > 0 ? <Text style={styles.parentNextStep}>{outstanding} chore{outstanding === 1 ? '' : 's'} to go before allowance review</Text> : null}
    </View>
  );
}

function ChildMoneyView({
  child,
  completed,
  onToggle,
}: {
  child: ChildProfile;
  completed: string[];
  onToggle: (childId: ChildId, choreId: string) => void;
}) {
  const doneCount = child.chores.filter((chore) => completed.includes(chore.id)).length;

  return (
    <View style={styles.childDashboard}>
      <View style={styles.childWelcome}>
        <View style={styles.childAvatarLarge}><Text style={styles.childAvatarTextLarge}>{child.initials}</Text></View>
        <View style={styles.childWelcomeCopy}>
          <Text style={styles.eyebrow}>YOUR MONEY PLAN</Text>
          <Text style={styles.childWelcomeTitle}>You&apos;re making progress, {child.name}.</Text>
          <Text style={styles.childWelcomeDetail}>Finish your responsibilities, then check in with a parent about allowance.</Text>
        </View>
      </View>

      <AllowanceProgress child={child} completedCount={doneCount} />

      <View style={styles.panelSection}>
        <View style={styles.sectionHeading}>
          <View style={styles.sectionIcon}><Ionicons name="checkbox-outline" size={17} color={colors.greenDeep} /></View>
          <View style={styles.sectionHeadingCopy}>
            <Text style={styles.sectionTitle}>My chores</Text>
            <Text style={styles.sectionSubtitle}>Your checklist for this week</Text>
          </View>
          <Text style={styles.sectionCount}>{doneCount}/{child.chores.length}</Text>
        </View>
        <ChoreChecklist child={child} completed={completed} onToggle={onToggle} />
      </View>

      <View style={styles.panelSection}>
        <View style={styles.sectionHeading}>
          <View style={[styles.sectionIcon, styles.goalIcon]}><Ionicons name={child.goalIcon} size={17} color={colors.teal} /></View>
          <View style={styles.sectionHeadingCopy}>
            <Text style={styles.sectionTitle}>My savings goal</Text>
            <Text style={styles.sectionSubtitle}>{child.goal}</Text>
          </View>
          <Text style={styles.goalPercentage}>{child.goalProgress}%</Text>
        </View>
        <View accessibilityLabel={`${child.goalProgress} percent toward ${child.goal}`} style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${child.goalProgress}%` }]} />
        </View>
        <View style={styles.goalDetailRow}>
          <Text style={styles.goalDetail}>{child.goalDetail}</Text>
          <Text style={styles.goalDetail}>Keep going!</Text>
        </View>
      </View>

      <View style={styles.panelSection}>
        <View style={styles.sectionHeading}>
          <View style={[styles.sectionIcon, styles.reminderIcon]}><Ionicons name="notifications-outline" size={17} color={colors.orange} /></View>
          <View style={styles.sectionHeadingCopy}>
            <Text style={styles.sectionTitle}>Reminders</Text>
            <Text style={styles.sectionSubtitle}>Helpful nudges for your account</Text>
          </View>
        </View>
        {child.reminders.map((reminder, index) => (
          <View key={reminder} style={[styles.reminderRow, index > 0 && styles.reminderDivider]}>
            <Ionicons name={index === 0 ? 'calendar-outline' : 'sparkles-outline'} size={15} color={colors.textSecondary} />
            <Text style={styles.reminderText}>{reminder}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.disclaimer}>Allowance tracking is a family planning tool. A parent or guardian reviews and confirms any transfer.</Text>
    </View>
  );
}

type ChoreStatus = Record<ChildId, string[]>;
const HouseholdActivity = React.createContext<readonly [ChoreStatus, React.Dispatch<React.SetStateAction<ChoreStatus>>] | null>(null);
export { children as youthProfiles, sharedFamilyGoals };
export function useHouseholdChores() {
  const activity = React.useContext(HouseholdActivity);
  if (!activity) throw new Error('Household activity provider is required');
  return activity[0];
}
export function HouseholdActivityProvider({ children }: { children: React.ReactNode }) {
  const state = useState<ChoreStatus>({ olivia: ['room', 'pet'], noah: ['table', 'sports'] });
  return <HouseholdActivity.Provider value={state}>{children}</HouseholdActivity.Provider>;
}

export default function FamilyMoneyHub({ profileId }: { profileId: DashboardProfileId }) {
  const isFamilyProfile = profileId === 'family';
  const isChildProfile = profileId === 'olivia' || profileId === 'noah';
  const [familyView, setFamilyView] = useState<'parent' | 'kids'>('parent');
  const [selectedKid, setSelectedKid] = useState<ChildId>('olivia');
  const activity = React.useContext(HouseholdActivity);
  if (!activity) throw new Error('FamilyMoneyHub requires HouseholdActivityProvider');
  const [completedChores, setCompletedChores] = activity;

  if (!isFamilyProfile && !isChildProfile) return null;

  const toggleChore = (childId: ChildId, choreId: string) => {
    setCompletedChores((current) => {
      const childTasks = current[childId];
      return {
        ...current,
        [childId]: childTasks.includes(choreId)
          ? childTasks.filter((taskId) => taskId !== choreId)
          : [...childTasks, choreId],
      };
    });
  };

  const childProfileId = isChildProfile ? profileId : selectedKid;
  const activeChild = children.find((child) => child.id === childProfileId) ?? children[0];

  return (
    <View style={styles.container}>
      {isFamilyProfile ? (
        <>
          <View style={styles.hubHeading}>
            <View style={styles.hubIcon}><Ionicons name="people-outline" size={19} color={colors.greenDeep} /></View>
            <View style={styles.hubHeadingCopy}>
            <Text style={styles.eyebrow}>FAMILY GOALS &amp; PLANNING</Text>
            <Text style={styles.hubTitle}>Make room for what matters</Text>
            <Text style={styles.hubSubtitle}>Shared savings goals and everyday habits, all in one place.</Text>
            </View>
          </View>
          <View style={styles.viewTabs} accessibilityRole="tablist" accessibilityLabel="Family dashboard view">
            <TouchableOpacity
              accessibilityRole="tab"
              accessibilityState={{ selected: familyView === 'parent' }}
              onPress={() => setFamilyView('parent')}
              style={[styles.viewTab, familyView === 'parent' && styles.viewTabSelected]}
            >
              <Ionicons name="people-outline" size={15} color={familyView === 'parent' ? colors.greenDeep : colors.textSecondary} />
              <Text style={[styles.viewTabText, familyView === 'parent' && styles.viewTabTextSelected]}>Parent view</Text>
            </TouchableOpacity>
            <TouchableOpacity
              accessibilityRole="tab"
              accessibilityState={{ selected: familyView === 'kids' }}
              onPress={() => setFamilyView('kids')}
              style={[styles.viewTab, familyView === 'kids' && styles.viewTabSelected]}
            >
              <Ionicons name="happy-outline" size={15} color={familyView === 'kids' ? colors.greenDeep : colors.textSecondary} />
              <Text style={[styles.viewTabText, familyView === 'kids' && styles.viewTabTextSelected]}>Kids view</Text>
            </TouchableOpacity>
          </View>
          {familyView === 'parent' ? (
            <>
              <FamilyGoalsCard />
              <View style={styles.parentSummary}>
                <View style={styles.parentSummaryMetric}>
                  <Text style={styles.parentSummaryLabel}>WEEKLY ALLOWANCE</Text>
                  <Text style={styles.parentSummaryValue}>$45</Text>
                  <Text style={styles.parentSummaryDetail}>Across both kids</Text>
                </View>
                <View style={styles.summaryDivider} />
                <View style={styles.parentSummaryMetric}>
                  <Text style={styles.parentSummaryLabel}>CHORES TO REVIEW</Text>
                  <Text style={styles.parentSummaryValue}>2</Text>
                  <Text style={styles.parentSummaryDetail}>One for each child</Text>
                </View>
              </View>
              <Text style={styles.sectionLabel}>EVERYDAY MONEY HABITS</Text>
              {children.map((child) => (
                <ParentChildCard
                  key={child.id}
                  child={child}
                  completed={completedChores[child.id]}
                  onToggle={toggleChore}
                />
              ))}
              <Text style={styles.disclaimer}>Allowance tracking is a family planning tool. A parent or guardian reviews and confirms any transfer.</Text>
            </>
          ) : (
            <>
              <View style={styles.kidSelector} accessibilityRole="tablist" accessibilityLabel="Choose a child view">
                {children.map((child) => (
                  <TouchableOpacity
                    key={child.id}
                    accessibilityRole="tab"
                    accessibilityState={{ selected: selectedKid === child.id }}
                    onPress={() => setSelectedKid(child.id)}
                    style={[styles.kidSelectorOption, selectedKid === child.id && styles.kidSelectorOptionSelected]}
                  >
                    <View style={[styles.childAvatarSmall, selectedKid === child.id && styles.childAvatarSmallSelected]}>
                      <Text style={[styles.childAvatarSmallText, selectedKid === child.id && styles.childAvatarSmallTextSelected]}>{child.initials}</Text>
                    </View>
                    <Text style={[styles.kidSelectorName, selectedKid === child.id && styles.kidSelectorNameSelected]}>{child.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <ChildMoneyView child={activeChild} completed={completedChores[activeChild.id]} onToggle={toggleChore} />
            </>
          )}
        </>
      ) : (
        <ChildMoneyView child={activeChild} completed={completedChores[activeChild.id]} onToggle={toggleChore} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginHorizontal: 16, marginBottom: spacing.md, padding: spacing.md, borderRadius: radius.xl, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.borderFaint, gap: spacing.md },
  hubHeading: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  hubIcon: { width: 40, height: 40, borderRadius: radius.md, backgroundColor: colors.greenDim, alignItems: 'center', justifyContent: 'center' },
  hubHeadingCopy: { flex: 1, minWidth: 0, gap: 2 },
  eyebrow: { color: colors.greenDeep, fontSize: 10, lineHeight: 14, fontFamily: font.body.bold, letterSpacing: 0.7 },
  hubTitle: { color: colors.text, fontSize: 17, lineHeight: 22, fontFamily: font.headline.bold },
  hubSubtitle: { color: colors.textSecondary, fontSize: 12, lineHeight: 17 },
  viewTabs: { flexDirection: 'row', padding: 4, borderRadius: radius.md, backgroundColor: colors.surfaceMid, gap: 4 },
  viewTab: { flex: 1, minHeight: 38, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderRadius: radius.sm },
  viewTabSelected: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.borderFaint },
  viewTabText: { color: colors.textSecondary, fontSize: 12, fontFamily: font.body.medium },
  viewTabTextSelected: { color: colors.greenDeep, fontFamily: font.body.bold },
  goalsCard: { padding: spacing.md, borderRadius: radius.lg, backgroundColor: colors.greenDim, gap: spacing.md },
  goalsHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  goalsIcon: { width: 36, height: 36, borderRadius: radius.md, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  goalsHeaderCopy: { flex: 1, minWidth: 0, gap: 2 },
  goalsEyebrow: { color: colors.greenDeep, fontSize: 9, lineHeight: 12, fontFamily: font.body.bold, letterSpacing: 0.6 },
  goalsTitle: { color: colors.text, fontSize: 15, lineHeight: 20, fontFamily: font.headline.bold },
  goalsSubtitle: { color: colors.textSecondary, fontSize: 10, lineHeight: 14 },
  goalsSummary: { flexDirection: 'row', alignItems: 'center', padding: 11, borderRadius: radius.md, backgroundColor: colors.surface },
  goalsSummaryMetric: { flex: 1, gap: 2 },
  goalsSummaryLabel: { color: colors.textSecondary, fontSize: 8, lineHeight: 11, fontFamily: font.body.bold, letterSpacing: 0.5 },
  goalsSummaryValue: { color: colors.text, fontSize: 17, lineHeight: 22, fontFamily: font.headline.bold },
  goalsSummarySuffix: { color: colors.textSecondary, fontSize: 9, fontFamily: font.body.regular },
  goalsSummaryDivider: { width: 1, height: 36, marginHorizontal: spacing.md, backgroundColor: colors.borderFaint },
  sharedGoalsList: { gap: spacing.sm },
  sharedGoal: { padding: 11, borderRadius: radius.md, backgroundColor: colors.surface, gap: 7 },
  sharedGoalTop: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  sharedGoalIdentity: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
  sharedGoalCopy: { flex: 1, minWidth: 0, gap: 1 },
  sharedGoalTitle: { color: colors.text, fontSize: 11, lineHeight: 15, fontFamily: font.headline.semibold },
  sharedGoalDescription: { color: colors.textSecondary, fontSize: 9, lineHeight: 12 },
  sharedGoalProgress: { color: colors.greenDeep, fontSize: 10, fontFamily: font.body.bold },
  sharedGoalDetails: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.sm },
  sharedGoalDetail: { color: colors.textSecondary, fontSize: 9, lineHeight: 13 },
  goalsFootnote: { color: colors.textSecondary, fontSize: 9, lineHeight: 13 },
  parentSummary: { flexDirection: 'row', alignItems: 'center', padding: spacing.md, borderRadius: radius.lg, backgroundColor: colors.greenDim },
  parentSummaryMetric: { flex: 1, gap: 2 },
  parentSummaryLabel: { color: colors.greenDeep, fontSize: 9, lineHeight: 13, fontFamily: font.body.bold, letterSpacing: 0.4 },
  parentSummaryValue: { color: colors.text, fontSize: 22, lineHeight: 27, fontFamily: font.headline.bold },
  parentSummaryDetail: { color: colors.textSecondary, fontSize: 10, lineHeight: 14 },
  summaryDivider: { width: 1, height: 46, marginHorizontal: spacing.md, backgroundColor: 'rgba(35,139,20,0.18)' },
  sectionLabel: { color: colors.textSecondary, fontSize: 10, lineHeight: 14, fontFamily: font.body.bold, letterSpacing: 0.6 },
  parentChildCard: { padding: spacing.md, borderRadius: radius.lg, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, gap: spacing.sm },
  childHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  childAvatar: { width: 38, height: 38, borderRadius: radius.full, backgroundColor: colors.greenDim, alignItems: 'center', justifyContent: 'center' },
  childAvatarText: { color: colors.greenDeep, fontSize: 11, fontFamily: font.body.bold },
  childHeaderCopy: { flex: 1, minWidth: 0, gap: 2 },
  childName: { color: colors.text, fontSize: 14, fontFamily: font.headline.semibold },
  childMeta: { color: colors.textSecondary, fontSize: 10, lineHeight: 14 },
  parentAllowanceAmount: { color: colors.text, fontSize: 12, fontFamily: font.headline.bold },
  parentAllowanceSuffix: { color: colors.textSecondary, fontSize: 9, fontFamily: font.body.regular },
  allowanceCard: { padding: 11, borderRadius: radius.md, backgroundColor: colors.surfaceMid, gap: 7 },
  allowanceTopline: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  allowanceIcon: { width: 30, height: 30, borderRadius: radius.sm, backgroundColor: colors.greenDim, alignItems: 'center', justifyContent: 'center' },
  allowanceCopy: { flex: 1, minWidth: 0, gap: 1 },
  allowanceLabel: { color: colors.textSecondary, fontSize: 8, lineHeight: 11, fontFamily: font.body.bold, letterSpacing: 0.5 },
  allowanceAmount: { color: colors.text, fontSize: 17, lineHeight: 21, fontFamily: font.headline.bold },
  allowanceBadge: { paddingHorizontal: 8, paddingVertical: 5, borderRadius: radius.full },
  allowanceBadgeReady: { backgroundColor: colors.greenDim },
  allowanceBadgePending: { backgroundColor: colors.yellowDim },
  allowanceBadgeText: { fontSize: 9, lineHeight: 12, fontFamily: font.body.bold },
  allowanceBadgeTextReady: { color: colors.greenDeep },
  allowanceBadgeTextPending: { color: colors.text },
  progressTrack: { height: 7, borderRadius: radius.full, overflow: 'hidden', backgroundColor: colors.surfaceHigh },
  progressFill: { height: '100%', borderRadius: radius.full, backgroundColor: colors.greenDeep },
  allowanceHint: { color: colors.textSecondary, fontSize: 10, lineHeight: 14 },
  choreList: { gap: 1 },
  choreListCompact: { backgroundColor: colors.surfaceMid, borderRadius: radius.md, paddingHorizontal: 9 },
  choreRow: { minHeight: 50, flexDirection: 'row', alignItems: 'center', gap: 9, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.borderFaint },
  choreRowCompact: { minHeight: 44 },
  choreCheck: { width: 21, height: 21, borderRadius: radius.full, borderWidth: 1.5, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  choreCheckComplete: { borderColor: colors.greenDeep, backgroundColor: colors.greenDeep },
  choreCopy: { flex: 1, minWidth: 0, gap: 1 },
  choreTitle: { color: colors.text, fontSize: 12, lineHeight: 16, fontFamily: font.body.medium },
  choreTitleComplete: { color: colors.textSecondary },
  choreDetail: { color: colors.textSecondary, fontSize: 9, lineHeight: 12 },
  choreStatus: { color: colors.textSecondary, fontSize: 9, fontFamily: font.body.medium },
  choreStatusComplete: { color: colors.greenDeep },
  goalMiniRow: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingTop: 2 },
  goalMiniText: { flex: 1, color: colors.textSecondary, fontSize: 10, lineHeight: 14 },
  parentNextStep: { color: colors.orange, fontSize: 10, lineHeight: 14, fontFamily: font.body.medium },
  kidSelector: { flexDirection: 'row', gap: spacing.sm },
  kidSelectorOption: { flex: 1, minHeight: 50, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, borderRadius: radius.md, backgroundColor: colors.surfaceMid, borderWidth: 1, borderColor: colors.borderFaint },
  kidSelectorOptionSelected: { backgroundColor: colors.greenDim, borderColor: colors.greenDeep },
  childAvatarSmall: { width: 27, height: 27, borderRadius: radius.full, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  childAvatarSmallSelected: { backgroundColor: colors.white },
  childAvatarSmallText: { color: colors.textSecondary, fontSize: 9, fontFamily: font.body.bold },
  childAvatarSmallTextSelected: { color: colors.greenDeep },
  kidSelectorName: { color: colors.textSecondary, fontSize: 12, fontFamily: font.body.medium },
  kidSelectorNameSelected: { color: colors.greenDeep, fontFamily: font.body.bold },
  childDashboard: { gap: spacing.md },
  childWelcome: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  childAvatarLarge: { width: 44, height: 44, borderRadius: radius.full, backgroundColor: colors.greenDim, alignItems: 'center', justifyContent: 'center' },
  childAvatarTextLarge: { color: colors.greenDeep, fontSize: 13, fontFamily: font.body.bold },
  childWelcomeCopy: { flex: 1, minWidth: 0, gap: 2 },
  childWelcomeTitle: { color: colors.text, fontSize: 15, lineHeight: 19, fontFamily: font.headline.bold },
  childWelcomeDetail: { color: colors.textSecondary, fontSize: 10, lineHeight: 14 },
  panelSection: { padding: spacing.md, borderRadius: radius.lg, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, gap: spacing.sm },
  sectionHeading: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  sectionIcon: { width: 31, height: 31, borderRadius: radius.sm, backgroundColor: colors.greenDim, alignItems: 'center', justifyContent: 'center' },
  goalIcon: { backgroundColor: colors.blueDim },
  reminderIcon: { backgroundColor: colors.orangeDim },
  sectionHeadingCopy: { flex: 1, minWidth: 0, gap: 1 },
  sectionTitle: { color: colors.text, fontSize: 13, lineHeight: 17, fontFamily: font.headline.semibold },
  sectionSubtitle: { color: colors.textSecondary, fontSize: 10, lineHeight: 14 },
  sectionCount: { color: colors.greenDeep, fontSize: 11, fontFamily: font.body.bold },
  goalPercentage: { color: colors.greenDeep, fontSize: 11, fontFamily: font.body.bold },
  goalDetailRow: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.sm },
  goalDetail: { color: colors.textSecondary, fontSize: 10, lineHeight: 14 },
  reminderRow: { minHeight: 34, flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  reminderDivider: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.borderFaint },
  reminderText: { flex: 1, color: colors.text, fontSize: 11, lineHeight: 15 },
  disclaimer: { color: colors.textSecondary, fontSize: 9, lineHeight: 13 },
});
