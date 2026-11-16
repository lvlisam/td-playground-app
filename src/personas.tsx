import React, { createContext, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

export type DashboardProfileId = 'jane' | 'james' | 'olivia' | 'noah' | 'family' | 'business';
export type DashboardTediProfileType = 'individual' | 'household' | 'youth' | 'business';

export function getDashboardTediProfileType(profileId: DashboardProfileId): DashboardTediProfileType {
  if (profileId === 'business') return 'business';
  if (profileId === 'family') return 'household';
  if (profileId === 'olivia' || profileId === 'noah') return 'youth';
  return 'individual';
}

type ProfileIcon = 'person-outline' | 'people-outline' | 'briefcase-outline';

export type DashboardProfile = {
  id: DashboardProfileId;
  name: string;
  initials: string;
  relationship: string;
  detail: string;
  need: string;
  badge: string;
  icon: ProfileIcon;
};

export const householdPersonas: DashboardProfile[] = [
  {
    id: 'jane',
    name: 'Jane',
    initials: 'JN',
    relationship: 'You',
    detail: 'Family planner',
    need: 'Personal and household money, together.',
    badge: 'TD Select',
    icon: 'person-outline',
  },
  {
    id: 'james',
    name: 'James',
    initials: 'JM',
    relationship: 'Husband',
    detail: 'Household co-planner',
    need: 'A clear view of his everyday accounts.',
    badge: 'Household',
    icon: 'person-outline',
  },
  {
    id: 'olivia',
    name: 'Olivia',
    initials: 'OL',
    relationship: 'Daughter',
    detail: 'Teen banking',
    need: 'Build confidence with allowance, spending, and savings goals.',
    badge: 'Teen profile',
    icon: 'person-outline',
  },
  {
    id: 'noah',
    name: 'Noah',
    initials: 'NH',
    relationship: 'Son',
    detail: 'Young saver',
    need: 'Turn allowance into a fun savings goal.',
    badge: 'Young saver',
    icon: 'person-outline',
  },
];

export const dashboardProfileOptions: DashboardProfile[] = [
  ...householdPersonas,
  {
    id: 'family',
    name: 'Family',
    initials: 'FM',
    relationship: 'Shared household',
    detail: 'Joint balances and goals',
    need: 'Shared household finances.',
    badge: 'Shared account',
    icon: 'people-outline',
  },
  {
    id: 'business',
    name: 'Small business',
    initials: 'SB',
    relationship: 'Jane’s business',
    detail: 'Business banking',
    need: 'A simpler view of business money.',
    badge: 'Business',
    icon: 'briefcase-outline',
  },
];

type DashboardProfileContextValue = {
  activeProfileId: DashboardProfileId;
  activeProfile: DashboardProfile;
  selectProfile: (profileId: DashboardProfileId) => void;
};

const DashboardProfileContext = createContext<DashboardProfileContextValue | null>(null);

export function DashboardProfileProvider({ children }: { children: ReactNode }) {
  const [activeProfileId, setActiveProfileId] = useState<DashboardProfileId>('jane');

  const value = useMemo<DashboardProfileContextValue>(() => ({
    activeProfileId,
    activeProfile: dashboardProfileOptions.find((profile) => profile.id === activeProfileId) ?? dashboardProfileOptions[0],
    selectProfile: setActiveProfileId,
  }), [activeProfileId]);

  return <DashboardProfileContext.Provider value={value}>{children}</DashboardProfileContext.Provider>;
}

export function useDashboardProfile() {
  const context = useContext(DashboardProfileContext);
  if (!context) {
    throw new Error('useDashboardProfile must be used within DashboardProfileProvider');
  }
  return context;
}
