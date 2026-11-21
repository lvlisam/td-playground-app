import React from 'react';
import { useAccounts } from '../accounts';
import type { DashboardProfile } from '../personas';
import { upcomingBillPayments, paidBillPayments } from '../financeData';
import { FinancialHealthCard, PaydayCountdownMeter, parseDashboardAmount, getDashboardRecommendation, getTediCategoryTotals, type DashboardAccount } from '../screens/DashboardScreen';
import { offers, relationshipExamples } from '../screens/BenefitsScreen';
import { notifications } from '../screens/NotificationsScreen';
import { stores, specialties, languages } from '../screens/SupportBookingScreen';
import { sharedFamilyGoals, youthProfiles, useHouseholdChores } from './FamilyMoneyHub';
import AccountMonthOverMonth from './AccountMonthOverMonth';

const money = (n: number) => n.toLocaleString('en-US', {style:'currency', currency:'USD'});
function Facts({rows}: {rows: [string,string][]}) {
  return <dl>{rows.map(([term, value]) => <div key={term}><dt>{term}</dt><dd>{value}</dd></div>)}</dl>;
}
function Panel({title, prompt, children}: {title:string; prompt:string; children:React.ReactNode}) {
  return <section className="cc-panel visit-review"><div className="cc-eyebrow">BRANCH CONVERSATION</div><h3>{title}</h3><p>{prompt}</p>{children}</section>;
}
export default function BranchReview({tab, profile, accounts, navigate}: {tab:string; profile:DashboardProfile; accounts:DashboardAccount[]; navigate:(route:string)=>void}) {
  const {accounts: baseAccounts, cardControls: c} = useAccounts();
  const chores = useHouseholdChores();
  const id = profile.id;
  const relationship = relationshipExamples[id];
  const youth = youthProfiles.filter(child => id === 'family' || child.id === id);
  if (tab === 'Home') {
    const categories = getTediCategoryTotals(id);
    const idea = getDashboardRecommendation(id, categories);
    const balance = (suffix:string) => parseDashboardAmount(accounts.find(a=>a.id.endsWith(suffix))?.amount ?? '0');
    const plan = accounts.find(a=>a.id==='savings')?.plan;
    const left = Math.max(0,balance('checking') - balance('card') - (plan?.kind === 'savings-goal' ? plan.monthlyContribution : 0) - upcomingBillPayments.reduce((n,b)=>n+parseDashboardAmount(b.amount),0));
    return <><Panel title="Everyday finances" prompt="Start with the amounts on the customer’s dashboard. Ask which balance or upcoming expense they want to talk through.">{id === 'jane' ? <PaydayCountdownMeter compact={false} amount={left}/> : <FinancialHealthCard compact={false} view={id}/>}</Panel>
      {!!youth.length && <Panel title="Family goals and allowance" prompt="Review progress together. Leave chore approvals and allowance decisions to the family.">{id === 'family' && <Facts rows={sharedFamilyGoals.map(g=>[g.title, `${money(g.saved)} of ${money(g.target)} · ${money(g.monthlyContribution)}/month`])}/>}{youth.map(child=><details key={child.id}><summary>{child.name} · {child.goalDetail}</summary><Facts rows={[[child.goal, `${child.goalProgress}%`],['Weekly allowance',money(child.allowance)],...child.chores.map((ch):[string,string]=>[ch.title,`${chores[child.id].includes(ch.id)?'Complete':'Pending'} · ${ch.detail}`]),['Reminders', child.reminders.join(' · ')]]}/></details>)}</Panel>}
      <Panel title="A topic to explore" prompt="Use the recent spending sample to ask whether the suggested topic fits the customer’s priorities."><Facts rows={categories.map(t=>[t.category,money(t.amount)])}/><button className="quick" onClick={()=>navigate(idea.destination)}>{idea.title} →</button></Panel></>;
  }
  if (tab === 'Insights') return <Panel title="Review the monthly plan" prompt="Compare actual spending with the plan, then ask whether the next contribution still fits."><Facts rows={accounts.flatMap((a):[string,string][] => !a.plan ? [] : [[a.name, a.plan.kind === 'spending' ? `${money(a.plan.spent)} spent of ${money(a.plan.monthlyBudget)} · ${money(a.plan.remaining)} remaining` : `${money(a.plan.savedAmount)} of ${money(a.plan.targetAmount)} · ${a.plan.targetDate}`]])}/>{accounts.every(a=>baseAccounts.some(b=>b.id===a.id)) && <AccountMonthOverMonth accounts={baseAccounts}/>}</Panel>;
  if (tab === 'Benefits') return <Panel title="Rewards and relationship options" prompt="Ask which benefit the customer would use. Check terms and eligibility before discussing an offer."><Facts rows={[[ 'Product mix',relationship.products.join(' · ')],['Illustrative comparison',`${relationship.products.length} product categories; peer example: ${relationship.peerProductCount}`],['Option to discuss',relationship.opportunity]]}/>{offers.map(o=><details key={o.title}><summary>{o.title}</summary><p>{o.detail}</p></details>)}<details><summary>Planning ideas shown to the customer</summary><p>{relationship.opportunityDetail}</p><Facts rows={relationship.strategy.map(s=>[s.title,s.detail])}/></details></Panel>;
  if (tab === 'Pay & Transfer') return <Panel title="Bill schedule" prompt="Walk through the example bills shown in Move money. Confirm the payee, amount and date before the customer authorizes anything."><Facts rows={upcomingBillPayments.map(b=>[b.merchant,`${b.amount} · ${b.timing}`])}/><details><summary>Previously paid bills</summary><Facts rows={paidBillPayments.map(b=>[b.merchant,`${b.amount} · ${b.timing}`])}/></details></Panel>;
  if (tab === 'Notifications') return <Panel title="Customer app alerts" prompt="These are the example alerts shown in the app. Ask which message brought the customer into the branch.">{notifications.map(n=><details key={n.id}><summary>{n.title} · {n.time}{n.unread?' · Unread':''}</summary><p>{n.detail}</p></details>)}</Panel>;
  if (tab === 'Card Manager' && accounts.some(a=>a.id.endsWith('card'))) return <Panel title="Card controls and limits" prompt="Review the example settings with the customer. Help them locate a control on their device rather than changing it here."><Facts rows={[[ 'Card status',c.frozen?'Frozen':'Not frozen'],['Daily spending limit',money(Number(c.dailyLimit))],['ATM limit',money(Number(c.atmLimit))],...([['Contactless',c.contactless],['Online payments',c.onlinePayments],['Alerts',c.notifications],['Biometrics',c.biometric],['Street Safe',c.streetSafe],['Single-use card created',c.singleUseCardCreated]] as [string,boolean][]).map(([k,v]):[string,string]=>[k,v?'Yes':'No'])]}/></Panel>;
  if (tab === 'Support & booking') return <Panel title="Plan the follow-up" prompt="Ask which location, language and specialist the customer prefers. These are example wait times, not confirmed bookings."><Facts rows={[...stores.map((s):[string,string]=>[s.name,`${s.address} · ${s.wait}`]),['Specialties',specialties.join(' · ')],['Languages',languages.join(' · ')]]}/></Panel>;
  return null;
}
