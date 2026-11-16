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

type AccountContextValue = {
  accounts: Account[];
  renameAccount: (accountId: AccountId, name: string) => void;
};

const AccountContext = createContext<AccountContextValue | null>(null);

export function AccountsProvider({ children }: { children: ReactNode }) {
  const [nicknames, setNicknames] = useState<Record<AccountId, string>>({
    checking: 'Everyday spending',
    savings: 'Family getaway',
    card: 'Travel & rewards',
  });

  const value = useMemo<AccountContextValue>(() => ({
    accounts: accountCatalog.map((account) => ({ ...account, name: nicknames[account.id] })),
    renameAccount: (accountId, name) => {
      setNicknames((current) => ({ ...current, [accountId]: name }));
    },
  }), [nicknames]);

  return <AccountContext.Provider value={value}>{children}</AccountContext.Provider>;
}

export function useAccounts() {
  const context = useContext(AccountContext);
  if (!context) {
    throw new Error('useAccounts must be used within AccountsProvider');
  }
  return context;
}
