import React from 'react';
import { dashboardProfileOptions as profiles, householdPersonas, useDashboardProfile, type DashboardProfileId } from '../personas';

type Props = { present: DashboardProfileId[]; setPresent: React.Dispatch<React.SetStateAction<DashboardProfileId[]>> };

export default function JourneyContext({ present, setPresent }: Props) {
  const { activeProfileId, selectProfile } = useDashboardProfile();
  const attendees = householdPersonas.filter(person => present.includes(person.id));
  return <section className="cc-journey" aria-label="Journey context">
    <div className="cc-journey-head"><h2>Journey context</h2><span>In-branch visit</span></div>
    <div className="cc-journey-counts">
      <div><strong>{attendees.length}</strong><div><b>Present for service</b><small>{attendees.map(p => p.name).join(', ') || 'No one marked present'}</small></div></div>
      <div><strong>{householdPersonas.length}</strong><div><b>Customers in Jane&apos;s family</b><small>Jane and her household</small></div></div>
    </div>
    <details className="cc-attendance"><summary>Manage attendance</summary><fieldset><legend>Who is present for this visit?</legend>{householdPersonas.map(person => <label key={person.id}><input type="checkbox" checked={present.includes(person.id)} onChange={() => setPresent(previous => previous.includes(person.id) ? previous.filter(id => id !== person.id) : [...previous, person.id])}/>{person.name}</label>)}</fieldset></details>
    <div className="cc-profile-tabs" role="tablist" aria-label="Customer profile">{profiles.map((profile, index) => <button type="button" key={profile.id} id={`cc-tab-${profile.id}`} role="tab" aria-selected={activeProfileId === profile.id} aria-controls="cc-profile-snapshot" tabIndex={activeProfileId === profile.id ? 0 : -1} onClick={() => selectProfile(profile.id)} onKeyDown={event => {
      const target = { ArrowRight: (index + 1) % profiles.length, ArrowLeft: (index + profiles.length - 1) % profiles.length, Home: 0, End: profiles.length - 1 }[event.key];
      if (target === undefined) return;
      event.preventDefault(); selectProfile(profiles[target].id); document.getElementById(`cc-tab-${profiles[target].id}`)?.focus();
    }}>{profile.name}</button>)}</div>
  </section>;
}
