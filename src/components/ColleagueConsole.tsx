import React, { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { type DashboardProfileId, useDashboardProfile } from "../personas";
import JourneyContext from './JourneyContext';
import { useAccounts } from "../accounts";
import { getDashboardAccounts, getTransactionsForProfile } from "../screens/DashboardScreen";
import CustomerRecord from './CustomerRecord';
import BranchReview from './BranchReview';
import { pointsByProfile } from '../screens/BenefitsScreen';
import TediMoveMoneyChat from './TediMoveMoneyChat';
import AccountDetails from './AccountDetails';
import ServiceCases from './ServiceCases';
import ServicingDialog from './ServicingDialog';
import { consoleStyles } from "./colleagueConsoleStyles";

type IconName = keyof typeof Ionicons.glyphMap;
function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  return (
    <span aria-hidden="true">
      <Ionicons name={name} size={size} color="currentColor" />
    </span>
  );
}
const destinations: [string, string, IconName][] = [
  ["Home", "Overview", "grid-outline"],
  ["Insights", "Insights", "analytics-outline"],
  ["Pay & Transfer", "Move money", "swap-horizontal"],
  ["Benefits", "Benefits", "gift-outline"],
  ["Get Help", "Service & support", "headset-outline"],
  ["Card Manager", "Cards", "card-outline"],
  ["Notifications", "Activity review", "notifications-outline"],
  ["Support & booking", "Appointments", "calendar-outline"],
  ["Account settings", "Account settings", "settings-outline"],
];
const headings: Record<string, string> = {
  Home: "Relationship overview",
  Insights: "Planning insights",
  "Pay & Transfer": "Money movement",
  Benefits: "Customer benefits",
  "Get Help": "Service case review",
  "Card Manager": "Card portfolio",
  Notifications: "Activity review",
  "Support & booking": "Appointment preparation",
  "Account settings": "Customer record settings",
  "Ask Tedi": "Colleague guidance",
};
const conversationStarters = {
  jane: 'Would it help to look at the bills due before payday or the next getaway contribution?',
  james: 'Which recent payment or account balance would you like to check together?',
  ava: 'What would you like to set aside from your next paycheck?',
  olivia: 'How much of your allowance would you like to put toward your headphones?',
  noah: 'Would you like to see how much more you need for your soccer cleats?',
  family: 'Should we look at the home savings goal or the getaway first?',
  business: 'Which upcoming expense do you want to make sure the business can cover?',
};
function ChannelArt() {
  return (
    <div className="channel-art" aria-hidden="true">
      <div className="orbit orbit-a" />
      <div className="orbit orbit-b" />
      <div className="orbit orbit-c" />
      <div className="station s1">
        <Icon name="phone-portrait-outline" size={26} />
      </div>
      <div className="station s2">
        <Icon name="business-outline" size={38} />
      </div>
      <div className="station s3">
        <Icon name="headset-outline" size={25} />
      </div>
    </div>
  );
}
export default function ColleagueConsole({
  activeTab,
  navigate,
  paired,
  toggleCustomerView,
}: {
  paired: boolean;
  toggleCustomerView: () => void;
  activeTab: string;
  navigate: (route: string) => void;
}) {
  const { activeProfile: p } = useDashboardProfile();
  const [present, setPresent] = useState<DashboardProfileId[]>(['jane']);
  const { accounts, edits } = useAccounts();
  const linked = getDashboardAccounts(p.id, accounts).map(a => ({ ...a, ...edits[a.id] }));
  const [service, setService] = useState<{ profile: string; record: string } | null>(null);
  const openService = (record: string) => setService({profile: p.id, record});
  const [detail, setDetail] = useState<"profile" | null>(null);
  const goal = linked.find((a) => a.plan?.kind === "savings-goal")?.plan;
  const history = getTransactionsForProfile(p.id);
  const title = headings[activeTab] ?? activeTab;
  const go = (r: string) => {
    setDetail(null);
    navigate(r);
  };
  const [paymentTopic, setPaymentTopic] = useState('move');
  const card = linked.find(a => a.id.endsWith('card'));
  const topics = [ ['move', 'Between accounts', 'Confirm the source, destination, and amount with the customer.'], ['send', 'Send or request', 'Verify the recipient, payment method, and amount with the customer.'], ['bills', 'Bill payment', 'Confirm the payee, bill amount, and due date with the customer.'] ];
  const rows: [string, string, IconName][] =
    activeTab === "Insights"
      ? goal?.kind === "savings-goal"
        ? [
            [
              "Savings target",
              `$${goal.targetAmount.toLocaleString()} by ${goal.targetDate}`,
              "flag-outline",
            ],
            [
              "Progress to date",
              `$${goal.savedAmount.toLocaleString()} saved`,
              "analytics-outline",
            ],
            [
              "Monthly contribution",
              `$${goal.monthlyContribution.toLocaleString()} planned`,
              "repeat-outline",
            ],
          ]
        : [
            [
              "No account-linked savings target",
              ['family','olivia','noah'].includes(p.id) ? 'Review the household and allowance goals on the overview.' : 'Ask whether the customer would like to set a savings milestone.',
              "flag-outline",
            ],
          ]
      : activeTab === "Pay & Transfer"
        ? [
            ['Review details', topics.find(t => t[0] === paymentTopic)?.[2] ?? topics[0][2], 'receipt-outline'],
            ['Customer authorization', 'Explain the next step. The customer authorizes the payment in their own banking channel; this workspace does not move funds.', 'people-outline'],
          ]
        : activeTab === "Benefits"
          ? [
              ["Relationship tier", p.badge, "ribbon-outline"],
              [
                "Rewards on file",
                `${pointsByProfile[p.id]} points shown in the customer’s illustrative rewards balance.`,
                "gift-outline",
              ],
              [
                "Offer eligibility",
                "Confirm current terms and eligibility before discussing an offer. A relationship tier alone does not establish eligibility.",
                "pricetag-outline",
              ],
            ]
          : activeTab === "Get Help" || activeTab === "Support & booking"
            ? [
                ["Phone", p.contactPhone, "call-outline"],
                [
                  "Virtual appointment",
                  "Confirm the meeting topic and preferred callback number before arranging a virtual appointment.",
                  "videocam-outline",
                ],
                [
                  "In branch",
                  "Discuss a branch visit for more involved banking needs.",
                  "business-outline",
                ],
              ]
            : activeTab === 'Card Manager' ? [[card?.name ?? 'No credit card on file', card ? `${card.detail} · Balance ${card.amount}` : 'Check linked deposit accounts for debit card inquiries.', 'card-outline']]
            : activeTab === 'Notifications' ? (history.length ? history.map((t): [string,string,IconName] => [t.merchant, `${t.category} · ${t.time} · ${t.amount}`, 'receipt-outline']) : [['No recent activity', 'There are no transactions on file for this profile.', 'receipt-outline']])
            : [['Email on file', p.contactEmail, 'mail-outline'], ['Phone on file', p.contactPhone, 'call-outline']];
  const [selection,setSelection] = useState<{profile:string; id:string} | null>(null);
  const selected = selection?.profile === p.id ? linked.find(a=>a.id === selection.id) : undefined;
  const accountList = (
    <div>
      {linked.map((a) => (
        <div key={a.id} className="cc-row">
          <button className="cc-account-link" aria-label={`View ${a.name} details`} onClick={()=>setSelection({profile:p.id,id:a.id})}>
          <i>
            <Icon
              name={a.id.endsWith("card") ? "card-outline" : "wallet-outline"}
            />
          </i>
          <div>
            <b>{a.name}</b>
            <small>
              {a.productLabel} · {a.detail}
            </small>
          </div>
          <strong>{a.amount}</strong><Icon name="chevron-forward" size={15}/></button>
          <button aria-label={`Edit ${a.name}`} title={`Edit ${a.name}`} onClick={() => openService(a.id)}><Icon name="pencil-outline" size={16}/></button>
        </div>
      ))}
    </div>
  );
  return (
    <div className={paired ? 'cc paired' : 'cc'}>
      <style>{consoleStyles}</style>
      {selected && <AccountDetails account={selected} activity={history} onClose={()=>setSelection(null)}/>}
      {service?.profile === p.id && <ServicingDialog accounts={linked} initialRecord={service.record} onClose={() => setService(null)} />}
      <header>
        <div className="cc-brand">
          <span>TD</span> Colleague <em>Workspace</em>
        </div>
        <div className="cc-tools">
          <button type="button" aria-pressed={paired} onClick={toggleCustomerView}><Icon name="phone-portrait-outline" size={16}/>Customer view</button>
          <button onClick={() => go('Ask Tedi')}><Icon name="sparkles-outline" size={15}/>Ask Tedi</button>

          <span className="cc-agent" aria-label="Colleague">
            <Icon name="person-outline" size={17} />
          </span>
        </div>
      </header>
      <div className="cc-shell">
        <aside>
          <div className="cc-eyebrow">WORKSPACE</div>
          <nav aria-label="Colleague workspace">
            {destinations.map(([r, label, icon]) => (
              <button
                key={r}
                title={label}
                aria-current={r === activeTab ? "page" : undefined}
                onClick={() => go(r)}
              >
                <Icon name={icon} />
                {label}
              </button>
            ))}
            <button onClick={() => openService('contact')}><Icon name="construct-outline" />Servicing</button>
          </nav>
          <div className="cc-foot">
            <Icon name="business-outline" />
            <div>
              <b>Branch workspace</b>
              <small>Store 0000</small>
            </div>
          </div>
        </aside>
        <main>
          <div className="cc-crumb">
            Workspace <span>/</span>{" "}
            <b>
              {destinations.find((d) => d[0] === activeTab)?.[1] ?? activeTab}
            </b>
          </div>
          <div className="cc-heading">
            <h1>{title}</h1>
            <label>
              <span className="cc-dot" />
              {activeTab === 'Home' ? 'Colleague session' : `${p.name} · ${p.badge}`}
            </label>
          </div>
          {activeTab === 'Get Help' && <ServiceCases rep />}
          {activeTab === 'Home' && <JourneyContext present={present} setPresent={setPresent} />}
          {activeTab === 'Home' && <section id="cc-profile-snapshot" role="tabpanel" aria-labelledby={`cc-tab-${p.id}`} className="cc-snapshot">
            <div className="cc-hero">
            <div className="cc-hero-copy">
              <div className="cc-eyebrow">CUSTOMER SNAPSHOT</div>
              <h2>{p.contactName}</h2>
              <p>
                {p.detail} <span>·</span> {p.tdRelationshipLength} with TD<br />
                {p.badge} <span>·</span> {linked.length} linked {linked.length === 1 ? 'account' : 'accounts'}
              </p>
              <button
                onClick={() =>
                  setDetail(detail === "profile" ? null : "profile")
                }
                aria-expanded={detail === "profile"}
              >
                {detail === "profile" ? "Close profile" : "View profile"}{" "}
                <Icon name="arrow-forward" size={15} />
              </button>
            </div>
            </div>
            <div className="cc-brief">
              <div className="cc-priority"><span className="cc-eyebrow">CUSTOMER PRIORITY</span><p>{p.need}</p><div className="visit-opener"><span className="cc-eyebrow">ASK DURING THE VISIT</span><p>“{conversationStarters[p.id]}”</p></div></div>
              <div className="cc-history"><h3>Recent activity</h3>
                {history.length ? <ul>{history.map(item => <li key={item.id}>
                  <div><b>{item.merchant}</b><small>{item.time}</small></div>
                  <strong className={item.amount.startsWith('+') ? 'credit' : undefined}>{item.amount}</strong>
                </li>)}</ul> : <p>No recent transactions on file.</p>}
              </div>
            </div>
          </section>}
          {activeTab === 'Home' && <CustomerRecord profile={p} accounts={linked} />}
          {activeTab === 'Home' && detail === "profile" && (
            <section className="cc-panel profile">
              <h3>Customer profile</h3>
              <dl className="cc-contact-fields">{[['Email',p.contactEmail],['Phone',p.contactPhone],['Relationship',p.relationship],['Age',p.ageLabel],['Relationship length',`${p.tdRelationshipLength} with TD`],['Relationship tier',p.badge]].map(([key,value])=><div key={key}><dt>{key}</dt><dd>{value}</dd></div>)}</dl>
              <button className="quick" onClick={() => openService('contact')}><Icon name="pencil-outline"/>Edit contact details</button>
            </section>
          )}
          {(activeTab === 'Home' || activeTab === 'Ask Tedi') && <section className="cc-panel" style={{marginTop:16}}><div className="cc-eyebrow">TEDI · NEXT BEST ACTION</div><h3>{goal?.kind === 'savings-goal' ? 'Review the savings contribution' : 'Confirm contact details'}</h3><p>{goal?.kind === 'savings-goal' ? `Check whether the $${goal.monthlyContribution.toLocaleString()} monthly contribution still fits ${p.contactName}’s goal.` : `Confirm how ${p.contactName} prefers to be reached before following up.`}</p><button className="quick" onClick={()=>openService(linked.find(a=>a.plan?.kind==='savings-goal')?.id ?? 'contact')}>Review {goal ? 'savings plan' : 'contact details'}<Icon name="arrow-forward" size={15}/></button></section>}
          {activeTab === 'Ask Tedi' ? <section className="cc-panel" style={{marginTop:16}}><TediMoveMoneyChat key={p.id} colleague onSelectAction={action=>{setPaymentTopic(action); go('Pay & Transfer');}}/></section> : activeTab === "Home" ? (
            <>
              <div className="cc-grid">
                <section className="cc-panel">
                  <div className="cc-section-title">
                    <div className="cc-eyebrow">RELATIONSHIP</div>
                    <h3>Account portfolio</h3>
                  </div>
                  {accountList}
                </section>
                <section className="cc-panel">
                  <div className="cc-section-title">
                    <div className="cc-eyebrow">COLLEAGUE TOOLS</div>
                    <h3>Quick actions</h3>
                  </div>
                  {(
                    [
                      ["Insights", "Review savings plan", "flag-outline"],
                      ["Pay & Transfer", "Guide a transfer", "swap-horizontal"],
                      ["Get Help", "Review service cases", "headset-outline"],
                    ] as [string, string, IconName][]
                  ).map(([route, label, icon]) => (
                    <button
                      className="quick"
                      key={route}
                      onClick={() => go(route)}
                    >
                      <Icon name={icon} size={17} />
                      {label}
                      <Icon name="chevron-forward" size={14} />
                    </button>
                  ))}
                </section>
              </div>

            </>
          ) : (
            <section className="cc-panel work-detail">
              <div className="cc-section-title">
                <div className="cc-eyebrow">COLLEAGUE BRIEF</div>
                <h3>
                  {activeTab === "Insights"
                    ? "Savings plan"
                    : activeTab === "Pay & Transfer"
                      ? "Payment guidance"
                      : activeTab === "Benefits"
                        ? "Benefits review"
                        : activeTab === "Get Help"
                          ? "Support channels"
                          : title}
                </h3>
              </div>
              {activeTab === 'Pay & Transfer' && <label>Guidance topic <select value={paymentTopic} onChange={e=>setPaymentTopic(e.target.value)}>{topics.map(([id,label])=><option key={id} value={id}>{label}</option>)}</select></label>}
              {rows.map(([name, text, icon]) => (
                <div className="cc-row" key={name}>
                  <i>
                    <Icon name={icon} />
                  </i>
                  <div>
                    <b>{name}</b>
                    <small>{text}</small>
                  </div>
                </div>
              ))}
              {activeTab === 'Insights' && goal && <button className="quick" onClick={()=>openService(linked.find(a=>a.plan === goal)!.id)}>Review savings plan</button>}
              {activeTab === 'Card Manager' && card && <button className="quick" onClick={()=>setSelection({profile:p.id,id:card.id})}>Inspect card activity</button>}
              {['Account settings','Support & booking'].includes(activeTab) && <button className="quick" onClick={()=>openService('contact')}>Review contact details</button>}
              {['Card Manager','Notifications'].includes(activeTab) && <button className="quick" onClick={()=>go('Get Help')}>Review customer cases</button>}
              {['Pay & Transfer','Benefits'].includes(activeTab) && <button className="quick" onClick={()=>go('Home')}>Review account portfolio</button>}
            </section>
          )}
          <BranchReview key={p.id} tab={activeTab} profile={p} accounts={linked} navigate={go} />
        </main>
      </div>
    </div>
  );
}
