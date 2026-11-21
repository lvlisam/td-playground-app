import useSWR from 'swr';
import { useAuth } from './auth';
import { supabase } from './supabase';
import { useDashboardProfile } from './personas';

export const kinds = ['Card replacement', 'Transaction dispute', 'Statement copy'] as const;
export const teams = ['Card services', 'Disputes team', 'Account services'] as const;
export type CaseKind = typeof kinds[number];
type Draft = { kind: CaseKind; subject: string; detail: string };
export type ServiceCase = Draft & {id: string; created_at: string; status: 'Submitted' | 'In review' | 'Resolved'; assignee: string | null; resolution: string | null};
const table = 'playground_service_cases';
const columns = 'id,created_at,kind,subject,detail,status,assignee,resolution';
let guestSequence = 0;
export function useCases() {
  const { user, loading } = useAuth();
  const { activeProfileId: profile } = useDashboardProfile();
  const key = [table,user?.id ?? 'guest',profile];
  const {data, error, isLoading, mutate} = useSWR<ServiceCase[]>(loading ? null : key,user ? async () => {
    const result = await supabase.from(table).select(columns).eq('owner_id',user.id).eq('profile_id',profile).order('created_at',{ascending:false});
    if(result.error) throw result.error;
    return result.data as ServiceCase[];
  } : null,{refreshInterval:user ? 20000 : 0});
  async function submit(draft: Draft) {
    let row: ServiceCase;
    if(user) {
      const result = await supabase.from(table).insert({...draft,profile_id:profile}).select(columns).single();
      if(result.error) throw result.error;
      row = result.data as ServiceCase;
    } else row = {...draft,id:`DEMO-${++guestSequence}`,created_at:new Date().toISOString(),status:'Submitted',assignee:null,resolution:null};
    await mutate(current => [row,...(current ?? [])],false);
    return row.id;
  }
  async function update(item: ServiceCase, assignee: string, resolution?: string) {
    const changes = {assignee,status: resolution ? 'Resolved' as const : 'In review' as const,resolution:resolution ?? null};
    if(user) {
      const result = await supabase.from(table).update(changes).eq('owner_id',user.id).eq('profile_id',profile).eq('id',item.id).eq('status',item.status).select('id').single();
      if(result.error) {void mutate(); throw result.error;}
    }
    await mutate(current => (current ?? []).map(c=>c.id === item.id && c.status === item.status ? {...c,...changes} : c),false);
  }
  return {cases:data ?? [],error,loading:loading || isLoading,signedIn:!!user,refresh:()=>mutate(),submit,update};
}
