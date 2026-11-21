import React from 'react';
import type { DashboardProfile } from '../personas';
import type { DashboardAccount } from '../screens/DashboardScreen';
import { getSavingsThisMonth } from '../screens/DashboardScreen';

const money = (n: number) => n.toLocaleString('en-US', {style:'currency', currency:'USD'});
const numeric = (amount: string) => Number(amount.replace('−', '-').replace(/[$,]/g, ''));

export default function CustomerRecord({profile, accounts}: {profile: DashboardProfile; accounts: DashboardAccount[]}) {
  const deposits = accounts.filter(a => !a.id.endsWith('card')).reduce((n,a)=>n+numeric(a.amount),0);
  const credit = accounts.filter(a=>a.id.endsWith('card')).reduce((n,a)=>n+numeric(a.amount),0);
  const metrics = [['Deposit balances',money(deposits)],['Card balances',accounts.some(a=>a.id.endsWith('card')) ? money(credit) : 'No card on file'],['Saved this month',money(getSavingsThisMonth(profile.id))]];
  return <section aria-label="Customer financial summary" className="cc-metrics">{metrics.map(([label,value])=><div className="metric" key={label}><div><small>{label}</small><b>{value}</b></div></div>)}</section>;
}
