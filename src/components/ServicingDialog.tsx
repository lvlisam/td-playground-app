import React, { useEffect, useRef, useState } from 'react';
import { useDashboardProfile } from '../personas';
import { useAccounts, type AccountPlan } from '../accounts';
import type { DashboardAccount } from '../screens/DashboardScreen';

function Field({ label, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return <label>{label}<input required {...props}/></label>;
}

export default function ServicingDialog({accounts, initialRecord, onClose}: {accounts: DashboardAccount[]; initialRecord: string; onClose: () => void}) {
  const {activeProfile, updateContact} = useDashboardProfile();
  const {renameAccount, updatePlan} = useAccounts();
  const dialog = useRef<HTMLDialogElement>(null);
  const [record, setRecord] = useState(initialRecord);
  const [message, setMessage] = useState('');
  const account = accounts.find(a => a.id === record);
  useEffect(() => { const el = dialog.current; el?.showModal(); return () => el?.close(); }, []);
  function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const text = (key: string) => String(data.get(key) ?? '').trim();
    if (!account) {
      if (!/^\+?[\d().\s-]+$/.test(text('phone')) || !/^\d{7,15}$/.test(text('phone').replace(/\D/g,''))) { setMessage('Enter a phone number with 7–15 digits.'); return; }
      updateContact(text('email'), text('phone'));
    } else {
      if (!text('nickname')) {setMessage('Enter an account nickname.'); return;}
      let plan: AccountPlan | null = null;
      if (account.plan?.kind === 'savings-goal') {
        if (!text('date')) {setMessage('Enter a target date.'); return;}
        plan = {kind:'savings-goal', targetAmount:Number(text('target')), monthlyContribution:Number(text('monthly')), targetDate:text('date'), savedAmount:account.plan.savedAmount};
      } else if (account.plan?.kind === 'spending') {
        const monthlyBudget = Number(text('budget'));
        plan = {...account.plan, monthlyBudget, remaining:monthlyBudget-account.plan.spent};
      }
      renameAccount(account.id, text('nickname'));
      if(plan) updatePlan(account.id, plan);
    }
    setMessage('Changes saved for this session.');
  }
  return <dialog className="svc" aria-labelledby="svc-heading" ref={dialog} onCancel={onClose}>
    <style>{`.cc dialog.svc{position:fixed;inset:0;margin:auto;width:min(460px,92vw);max-height:90vh;overflow:auto;box-sizing:border-box;border:0;border-radius:18px;background:white;color:#1c2820;padding:28px;box-shadow:0 16px 64px #12392333}.svc::backdrop{background:#10251977}.svc h2{margin:6px 0;font-size:26px}.svc p{line-height:1.5;font-size:14px}.svc label{display:grid;gap:5px;font-size:13px;font-weight:600;margin:14px 0}.svc input,.svc select{box-sizing:border-box;width:100%;border:1px solid #a8b6ac;border-radius:8px;color:inherit;background:white;padding:10px;font:inherit}.svc footer{display:flex;justify-content:flex-end;gap:8px}.cc .svc button{padding:10px 16px;border-radius:8px;border:1px solid #adb9b0;cursor:pointer}.cc .svc button[type=submit]{background:#164c35;color:white}.svc .summary{padding:12px;background:#f1f5ef;border-radius:8px}.svc [role=status]{font-weight:600}`}</style>
    <div className="cc-eyebrow">COLLEAGUE TOOLS</div><h2 id="svc-heading">Customer servicing</h2><p>{activeProfile.contactName} · {activeProfile.badge}</p>
    <label>Service record<select value={record} onChange={e=>{setRecord(e.target.value);setMessage('');}}><option value="contact">Contact details</option>{accounts.map(a=><option key={a.id} value={a.id}>{a.name}</option>)}</select></label>
    <form key={record} onSubmit={save} onChange={()=>setMessage('')}>
      {account ? <><p className="summary">{account.productLabel} · {account.detail}<br/>{account.amountLabel}: <strong>{account.amount}</strong></p><Field label="Account nickname" name="nickname" defaultValue={account.name} maxLength={40}/>
      {account.plan?.kind==='savings-goal' && <><Field label="Savings target ($)" name="target" type="number" min="0.01" max="999999999" step="0.01" defaultValue={account.plan.targetAmount}/><Field label="Monthly contribution ($)" name="monthly" type="number" min="0" max="999999999" step="0.01" defaultValue={account.plan.monthlyContribution}/><Field label="Target date" name="date" defaultValue={account.plan.targetDate} maxLength={24}/></>}
      {account.plan?.kind==='spending' && <Field label="Monthly budget ($)" name="budget" type="number" min="0.01" max="999999999" step="0.01" defaultValue={account.plan.monthlyBudget}/>}</> : <><Field label="Email address" type="email" name="email" maxLength={254} defaultValue={activeProfile.contactEmail}/><Field label="Phone number" type="tel" name="phone" maxLength={25} defaultValue={activeProfile.contactPhone}/></>}
      <p>Changes apply to this playground session only. No bank records are updated.</p><p role="status">{message}</p><footer><button type="button" onClick={onClose}>Close</button><button type="submit">Save changes</button></footer>
    </form>
  </dialog>;
}
