import React, { createContext, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { colors } from './theme';
import { useDashboardProfile } from './personas';
import type { DashboardProfileId } from './personas';

export type AccountId = 'checking' | 'savings' | 'card';

export type AccountPlan =
  | { kind: 'spending'; monthlyBudget: number; spent: number; remaining: number }
  | { kind: 'savings-goal'; targetAmount: number; savedAmount: number; monthlyContribution: number; targetDate: string };

export type Account = {
  id: AccountId;
  name: string;
  productLabel: string;
  detail: string;
  amount: string;
  amountLabel: string;
  note?: string;
  swatch: string;
  plan: AccountPlan | null;
};

const accountCatalog: Omit<Account, 'name'>[] = [
  {
    id: 'checking',
    productLabel: 'Checking account',
    detail: '•••• 4821',
    amount: '$6,842.17',
    amountLabel: 'Available balance',
    swatch: colors.green,
    plan: { kind: 'spending', monthlyBudget: 4500, spent: 1680, remaining: 2820 },
  },
  {
    id: 'savings',
    productLabel: 'Savings account',
    detail: '•••• 9310 · 4.60% APY',
    amount: '$53,220.00',
    amountLabel: 'Current balance',
    swatch: colors.green,
    plan: { kind: 'savings-goal', targetAmount: 12000, savedAmount: 6420, monthlyContribution: 450, targetDate: 'Dec 2027' },
  },
  {
    id: 'card',
    productLabel: 'Credit card',
    detail: '$10,715.44 available',
    note: '18,420 TD Points',
    amount: '−$1,284.56',
    amountLabel: 'Current balance',
    swatch: colors.text,
    plan: null,
  },
];

const initialCardControls = { frozen: false, streetSafe: false, contactless: true, onlinePayments: true, notifications: true, biometric: true, singleUseCardCreated: false, dailyLimit: '5000', atmLimit: '1000' };
type CardControls = typeof initialCardControls;

type AccountContextValue = {
  cardControls: CardControls;
  updateCard: (changes: Partial<CardControls>) => void;
  accounts: Account[];
  edits: Record<string, Partial<Pick<Account, 'name' | 'plan'>>>;
  renameAccount: (accountId: string, name: string) => void;
  updatePlan: (accountId: string, plan: AccountPlan) => void;
};

const AccountContext = createContext<AccountContextValue | null>(null);

export function AccountsProvider({ children }: { children: ReactNode }) {
  const { activeProfileId } = useDashboardProfile();
  const [cards, setCards] = useState<Partial<Record<DashboardProfileId, CardControls>>>({});
  const [byProfile, setByProfile] = useState<Partial<Record<DashboardProfileId, AccountContextValue['edits']>>>({});
  const value = useMemo<AccountContextValue>(() => {
    const edits = byProfile[activeProfileId] ?? {};
    const names = { checking: 'Everyday spending', savings: 'Family getaway', card: 'Travel & rewards' };
    function patch(id: string, changes: Partial<Pick<Account, 'name' | 'plan'>>) {
      setByProfile(current => ({ ...current, [activeProfileId]: { ...current[activeProfileId], [id]: { ...current[activeProfileId]?.[id], ...changes } } }));
    }
    return { edits, cardControls: cards[activeProfileId] ?? initialCardControls,
      updateCard: changes => setCards(current => ({...current, [activeProfileId]: {...initialCardControls, ...current[activeProfileId], ...changes}})), accounts: accountCatalog.map(a => ({ ...a, name: names[a.id], ...edits[a.id] })),
      renameAccount: (id, name) => patch(id, { name }), updatePlan: (id, plan) => patch(id, { plan }) };
  }, [activeProfileId, byProfile, cards]);

  return <AccountContext.Provider value={value}>{children}</AccountContext.Provider>;
}

export function useAccounts() {
  const context = useContext(AccountContext);
  if (!context) {
    throw new Error('useAccounts must be used within AccountsProvider');
  }
  return context;
}
