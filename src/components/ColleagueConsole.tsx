import React, { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { dashboardProfileOptions, useDashboardProfile } from "../personas";
import { useAccounts } from "../accounts";
import { getDashboardAccounts, getTransactionsForProfile } from "../screens/DashboardScreen";
import TediMoveMoneyChat from './TediMoveMoneyChat';
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
];
const headings: Record<string, string> = {
  Home: "Relationship overview",
  Insights: "Planning insights",
  "Pay & Transfer": "Money movement",
  Benefits: "Customer benefits",
  "Get Help": "Service & support",
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
  companion,
  toggleCompanion,
}: {
  activeTab: string;
  navigate: (route: string, params?: {action: string}) => void;
  companion: boolean;
  toggleCompanion: () => void;
}) {
  const { activeProfile: p, selectProfile } = useDashboardProfile();
  const { accounts, edits } = useAccounts();
  const linked = getDashboardAccounts(p.id, accounts).map(a => ({ ...a, ...edits[a.id] }));
  const [service, setService] = useState<{ profile: string; record: string } | null>(null);
  const openService = (record: string) => setService({profile: p.id, record});
  const [detail, setDetail] = useState<"profile" | null>(null);
  const goal = linked.find((a) => a.plan?.kind === "savings-goal")?.plan;
  const history = p.id === 'ava' ? [] : getTransactionsForProfile(p.id).slice(0, 3);
  const title = headings[activeTab] ?? activeTab;
  const go = (r: string) => {
    setDetail(null);
    navigate(r);
  };
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
              "No goal on file",
              "Discuss a first savings milestone with the customer.",
              "flag-outline",
            ],
          ]
      : activeTab === "Pay & Transfer"
        ? [
            [
              "Send or request",
              "Review the recipient and payment method together.",
              "people-outline",
            ],
            [
              "Pay a bill",
              "Confirm the payee, amount and due date.",
              "receipt-outline",
            ],
            [
              "Move between accounts",
              "Check the source and destination before the customer confirms.",
              "swap-horizontal",
            ],
          ]
        : activeTab === "Benefits"
          ? [
              ["Relationship tier", p.badge, "ribbon-outline"],
              [
                "Rewards on file",
                linked.find((a) => a.note)?.note ??
                  "No rewards balance shown on this profile.",
                "gift-outline",
              ],
              [
                "Offer eligibility",
                "Review the terms in the customer view before discussing an offer.",
                "pricetag-outline",
              ],
            ]
          : activeTab === "Get Help" || activeTab === "Support & booking"
            ? [
                ["Phone", p.contactPhone, "call-outline"],
                [
                  "Virtual appointment",
                  "Use the booking view to explore virtual appointments.",
                  "videocam-outline",
                ],
                [
                  "In branch",
                  "Discuss a branch visit for more involved banking needs.",
                  "business-outline",
                ],
              ]
            : [
                [
                  activeTab,
                  `Review ${activeTab.toLowerCase()} alongside the customer in the linked mobile view.`,
                  "phone-portrait-outline",
                ],
              ];
  const accountList = (
    <div>
      {linked.map((a) => (
        <div key={a.id} className="cc-row">
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
          <strong>{a.amount}</strong>
          <button aria-label={`Edit ${a.name}`} title={`Edit ${a.name}`} onClick={() => openService(a.id)}><Icon name="pencil-outline" size={16}/></button>
        </div>
      ))}
    </div>
  );
  return (
    <div className={`cc ${companion ? "paired" : ""}`}>
      <style>{consoleStyles}</style>
      {service?.profile === p.id && <ServicingDialog accounts={linked} initialRecord={service.record} onClose={() => setService(null)} />}
      <header>
        <div className="cc-brand">
          <span>TD</span> Colleague <em>Workspace</em>
        </div>
        <div className="cc-tools">
          <button onClick={() => go('Ask Tedi')}><Icon name="sparkles-outline" size={15}/>Ask Tedi</button>
          <button onClick={toggleCompanion} aria-pressed={companion}>
            <Icon name="phone-portrait-outline" size={15} />
            {companion ? "Hide customer view" : "Customer view"}
          </button>
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
              Linked channels
            </label>
          </div>
          <section className="cc-snapshot" aria-label="Customer snapshot">
            <div className="cc-hero">
            <div className="cc-hero-copy">
              <div className="cc-eyebrow">CUSTOMER SNAPSHOT</div>
              <h2>{p.contactName}</h2>
              <p>
                {p.detail} <span>·</span> {p.tdRelationshipLength} with TD
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
            <ChannelArt />
            </div>
            <div className="cc-brief">
              <div className="cc-priority"><span className="cc-eyebrow">CUSTOMER PRIORITY</span><p>{p.need}</p></div>
              <div className="cc-history"><h3>Recent activity</h3>
                {history.length ? <ul>{history.map(item => <li key={item.id}>
                  <div><b>{item.merchant}</b><small>{item.time}</small></div>
                  <strong className={item.amount.startsWith('+') ? 'credit' : undefined}>{item.amount}</strong>
                </li>)}</ul> : <p>No recent transactions on file.</p>}
              </div>
            </div>
          </section>
          {detail === "profile" && (
            <section className="cc-panel profile">
              <h3>Customer profile</h3>
              <label>
                Selected profile{" "}
                <select
                  value={p.id}
                  onChange={(e) =>
                    selectProfile(
                      dashboardProfileOptions.find(
                        (x) => x.id === e.target.value,
                      )!.id,
                    )
                  }
                >
                  {dashboardProfileOptions.map((x) => (
                    <option key={x.id} value={x.id}>
                      {x.name}
                    </option>
                  ))}
                </select>
              </label>
              <p>
                {p.contactEmail} · {p.contactPhone}
              </p>
              <p>{p.need}</p>
              <button className="quick" onClick={() => openService('contact')}><Icon name="pencil-outline"/>Edit contact details</button>
            </section>
          )}
          {(activeTab === 'Home' || activeTab === 'Ask Tedi') && <section className="cc-panel" style={{marginTop:16}}><div className="cc-eyebrow">TEDI · NEXT BEST ACTION</div><h3>{goal?.kind === 'savings-goal' ? 'Review the savings contribution' : 'Confirm contact details'}</h3><p>{goal?.kind === 'savings-goal' ? `Check whether the $${goal.monthlyContribution.toLocaleString()} monthly contribution still fits ${p.contactName}’s goal.` : `Confirm how ${p.contactName} prefers to be reached before following up.`}</p><button className="quick" onClick={()=>openService(linked.find(a=>a.plan?.kind==='savings-goal')?.id ?? 'contact')}>Review {goal ? 'savings plan' : 'contact details'}<Icon name="arrow-forward" size={15}/></button></section>}
          {activeTab === 'Ask Tedi' ? <section className="cc-panel" style={{marginTop:16}}><TediMoveMoneyChat key={p.id} onSelectAction={action=>{if(!companion) toggleCompanion(); navigate('Pay & Transfer',{action});}}/></section> : activeTab === "Home" ? (
            <>
              <div className="cc-metrics">
                {(
                  [
                    [
                      "wallet-outline",
                      "Linked accounts",
                      String(linked.length).padStart(2, "0"),
                    ],
                    ["ribbon-outline", "Relationship tier", p.badge],
                    ["time-outline", "Customer tenure", p.tdRelationshipLength],
                  ] as [IconName, string, string][]
                ).map(([icon, label, value]) => (
                  <div className="metric" key={label}>
                    <i>
                      <Icon name={icon} />
                    </i>
                    <div>
                      <small>{label}</small>
                      <b>{value}</b>
                    </div>
                  </div>
                ))}
              </div>
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
                      ["Get Help", "Explore support", "headset-outline"],
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
            </section>
          )}
        </main>
      </div>
    </div>
  );
}
