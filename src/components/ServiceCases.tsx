import React, {useState} from 'react';
import {View, Text, TouchableOpacity, TextInput, StyleSheet} from 'react-native';
import {colors,font} from '../theme';
import {useDashboardProfile} from '../personas';
import {useAuth} from '../auth';
import {useAccounts} from '../accounts';
import {getDashboardAccounts,getTransactionsForProfile} from '../screens/DashboardScreen';
import {useCases,kinds,teams,type CaseKind,type ServiceCase} from '../serviceCases';

function Button({label,action,selected,primary,disabled}:{label:string;action:()=>void;selected?:boolean;primary?:boolean;disabled?:boolean}) {
  return <TouchableOpacity accessibilityRole="button" accessibilityState={{selected,disabled}} disabled={disabled} onPress={action} style={[s.button,selected && s.selected,primary && s.primary,disabled && {opacity:.5}]}><Text style={[s.buttonText,primary && {color:colors.white}]}>{label}</Text></TouchableOpacity>;
}
const reasons: Record<CaseKind,string[]> = {'Card replacement':['Damaged card','Lost card','Stolen card'],'Transaction dispute':['Unrecognized charge','Duplicate charge','Incorrect amount'],'Statement copy':Array.from({length:12},(_,i)=>new Date(2026,9-i,1).toLocaleDateString('en-US',{month:'long',year:'numeric'}))};
function RequestForm({submit}:{submit:ReturnType<typeof useCases>['submit']}) {
  const {activeProfileId} = useDashboardProfile();
  const {accounts,edits} = useAccounts();
  const [kind,setKind] = useState<CaseKind|null>(null);
  const [target,setTarget] = useState('');
  const [detail,setDetail] = useState('');
  const [busy,setBusy] = useState(false);
  const [notice,setNotice] = useState('');
  const linked = getDashboardAccounts(activeProfileId,accounts).map(a=>({...a,...edits[a.id]}));
  const subjects = kind==='Transaction dispute' ? (activeProfileId==='ava'?[]:getTransactionsForProfile(activeProfileId)).filter(t=>!t.amount.startsWith('+')).map(t=>`${t.merchant} · ${t.amount} · ${t.time}`) : linked.filter(a=>kind!=='Card replacement'||a.id.endsWith('card')||a.id.endsWith('checking')).map(a=>`${a.name}${kind==='Card replacement' && a.id.endsWith('checking')?' debit card':''} · ${a.detail.split(' · ')[0]}`);
  return <View style={s.stack}><Text style={s.label}>Start a request</Text><View style={s.wrap}>{kinds.map(k=><Button key={k} label={k} disabled={busy} selected={k===kind} action={()=>{setKind(k);setTarget('');setDetail('');setNotice('');}}/>)}</View>
    {kind && <><Text style={s.label}>{kind==='Transaction dispute'?'Which transaction?':kind==='Card replacement'?'Which card?':'Which account?'}</Text><View style={s.wrap}>{subjects.map(v=><Button key={v} label={v} disabled={busy} selected={target===v} action={()=>setTarget(v)}/>)}</View>
    {!subjects.length ? <Text style={s.copy}>No eligible items for this profile.</Text> : <><Text style={s.label}>{kind==='Statement copy'?'Statement month':'Reason for request'}</Text><View style={s.wrap}>{reasons[kind].map(v=><Button key={v} label={v} disabled={busy} selected={detail===v} action={()=>setDetail(v)}/>)}</View>
    <Button primary label={busy?'Submitting…':'Submit demo request'} disabled={busy||!subjects.includes(target)||!detail} action={async()=>{setBusy(true);try{const id=await submit({kind,subject:target,detail});setNotice(`Request ${id.slice(0,8)} submitted.`);setKind(null);}catch{setNotice('Could not submit. Check your connection and try again.');}finally{setBusy(false);}}}/></>}</>}
    {!!notice && <Text accessibilityLiveRegion="polite" style={s.label}>{notice}</Text>}</View>;
}
function CaseRow({item,rep,update}:{item:ServiceCase;rep:boolean;update:ReturnType<typeof useCases>['update']}) {
  const [open,setOpen]=useState(false),[team,setTeam]=useState(item.assignee??teams[kinds.indexOf(item.kind)]),[note,setNote]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState('');
  async function save(resolve:boolean){setBusy(true);setError('');try{await update(item,team,resolve?note.trim():undefined);setOpen(false);}catch{setError('Could not update this case. Check its current status and try again.');}finally{setBusy(false);}}
  return <View style={s.row}><Text style={s.kicker}>{item.status.toUpperCase()} · {item.id.slice(0,8)}</Text><Text style={s.label}>{item.kind}</Text><Text style={s.copy}>{item.subject}</Text><Text style={s.copy}>{item.detail} · {new Date(item.created_at).toLocaleDateString()}</Text>{!!item.assignee && <Text style={s.copy}>Assigned to {item.assignee}</Text>}{!!item.resolution && <Text style={s.label}>Outcome: {item.resolution}</Text>}
  {rep && item.status!=='Resolved' && <Button label={open?'Close review':'Review case'} disabled={busy} action={()=>setOpen(!open)}/>}
  {rep && open && item.status!=='Resolved' && <><Text style={s.label}>Responsible team</Text><View style={s.wrap}>{teams.map(t=><Button key={t} label={t} selected={team===t} disabled={busy} action={()=>setTeam(t)}/>)}</View><Button label="Assign case" disabled={busy||item.assignee===team} action={()=>save(false)}/>{item.status==='In review' && <><Text style={s.label}>Outcome for the customer</Text><TextInput accessibilityLabel="Outcome for the customer" value={note} onChangeText={setNote} maxLength={240} placeholder="Describe the simulated resolution" style={s.input}/><Button primary label="Resolve case" disabled={busy||!note.trim()} action={()=>save(true)}/></>}</>}{!!error && <Text accessibilityLiveRegion="polite" style={s.copy}>{error}</Text>}</View>;
}
function CasesPanel({rep}:{rep:boolean}) {
  const store=useCases(); const {activeProfile}=useDashboardProfile();
  return <View style={s.panel}><Text style={s.kicker}>{rep?'COLLEAGUE TOOLS':'SELF-SERVICE'}</Text><Text accessibilityRole="header" style={s.title}>{rep?'Service case queue':'My service requests'}</Text><Text style={s.copy}>{rep?`Review requests for ${activeProfile.contactName}.`:'Request a replacement card, dispute a charge, or ask for a statement.'} Playground only; no bank action is taken. {store.signedIn?'Cases are saved in your private playground.':'Guest cases clear on reload.'}</Text>
  {store.loading?<Text style={s.copy}>Loading requests…</Text>:store.error?<><Text style={s.copy}>Cases could not be loaded.</Text><Button label="Retry" action={()=>void store.refresh()}/></>:<>{!rep && <RequestForm submit={store.submit}/>}<Text style={s.label}>{rep?'Customer cases':'Track my requests'} ({store.cases.length})</Text>{store.cases.length?store.cases.map(item=><CaseRow key={item.id} item={item} rep={rep} update={store.update}/>):<Text style={s.copy}>{rep?'No cases yet. Requests submitted in the customer view appear here.':'No requests yet.'}</Text>}</>}
  </View>;
}
export default function ServiceCases({rep=false}:{rep?:boolean}) {const {activeProfileId}=useDashboardProfile();const {user}=useAuth();return <CasesPanel key={`${activeProfileId}:${user?.id??'guest'}`} rep={rep}/>;}
const s=StyleSheet.create({panel:{backgroundColor:colors.surface,borderRadius:16,borderWidth:1,borderColor:colors.border,padding:20,gap:10,marginVertical:12},stack:{gap:10},wrap:{flexDirection:'row',flexWrap:'wrap',gap:6},title:{fontFamily:font.headline.bold,fontSize:24,color:colors.text},kicker:{fontFamily:font.body.bold,fontSize:11,letterSpacing:1,color:colors.greenDeep},label:{fontFamily:font.body.bold,fontSize:15,color:colors.text},copy:{fontFamily:font.body.regular,fontSize:14,lineHeight:20,color:colors.textSecondary},button:{minHeight:44,paddingVertical:9,paddingHorizontal:12,borderRadius:8,borderWidth:1,borderColor:colors.border,justifyContent:'center',alignSelf:'flex-start',maxWidth:'100%'},selected:{backgroundColor:colors.greenDim,borderColor:colors.greenDeep},primary:{backgroundColor:colors.greenDeep},buttonText:{fontFamily:font.body.medium,color:colors.text,fontSize:14},row:{borderTopWidth:1,borderColor:colors.border,paddingTop:14,gap:7},input:{padding:12,borderWidth:1,borderColor:colors.border,borderRadius:8,color:colors.text}});
