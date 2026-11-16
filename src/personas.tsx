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
  ageLabel: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  tdRelationshipLength: string;
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
    ageLabel: '36',
    contactName: 'Jane Williams',
    contactEmail: 'jane.williams@example.com',
    contactPhone: '+1 (416) 555-0101',
    tdRelationshipLength: '12 years',
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
    ageLabel: '38',
    contactName: 'James Williams',
    contactEmail: 'james.williams@example.com',
    contactPhone: '+1 (416) 555-0102',
    tdRelationshipLength: '10 years',
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
    ageLabel: '16',
    contactName: 'Olivia Williams',
    contactEmail: 'olivia.williams@example.com',
    contactPhone: '+1 (416) 555-0103',
    tdRelationshipLength: '3 years',
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
    ageLabel: '12',
    contactName: 'Noah Williams',
    contactEmail: 'noah.williams@example.com',
    contactPhone: '+1 (416) 555-0104',
    tdRelationshipLength: '2 years',
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
    ageLabel: 'Household ages 12–38',
    contactName: 'Jane Williams (primary contact)',
    contactEmail: 'jane.williams@example.com',
    contactPhone: '+1 (416) 555-0101',
    tdRelationshipLength: '12 years',
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
    ageLabel: 'Owner age 36',
    contactName: 'Jane Williams',
    contactEmail: 'jane@northstarstudio.example.com',
    contactPhone: '+1 (416) 555-0105',
    tdRelationshipLength: '5 years',
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
