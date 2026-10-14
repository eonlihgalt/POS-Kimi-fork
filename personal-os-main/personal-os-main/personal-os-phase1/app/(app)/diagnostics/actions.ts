'use server';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

type Status='PASS'|'WARN'|'FAIL';
type Result={id:string;name:string;status:Status;detail:string;recommendation?:string};
async function safeLog(supabase:any,userId:string,code:string,area:string,message:string){
  await supabase.from('diagnostic_events').insert({user_id:userId,code,area,route:'/diagnostics',severity:'error',message:message.slice(0,500)});
}
export async function runSelfTest(){
 const startedAt=new Date().toISOString(); const runId=crypto.randomUUID();
 const supabase=await createClient(); const {data:{user}}=await supabase.auth.getUser(); if(!user)redirect('/login');
 const results:Result[]=[]; const add=(id:string,name:string,status:Status,detail:string,recommendation?:string)=>results.push({id,name,status,detail,recommendation});
 add('AUTH-001','Authentication','PASS','Authenticated user session is available.');
 const checks=[
  ['DB-001','Debug Sessions','debug_sessions','id, archived_at','Verify the v0.3 archive migration is applied.'],
  ['DB-002','Observations','observations','id, debug_session_id','Verify the observations schema and RLS policies.'],
  ['DB-003','Components','components','id, title','Verify the components schema and RLS policies.'],
  ['DB-004','Component Evidence','component_evidence','component_id, observation_id','Verify the component_evidence schema and RLS policies.'],
  ['LOG-001','Diagnostic Events','diagnostic_events','id, code, severity, created_at','Apply the v0.4 diagnostic_events migration.']
 ] as const;
 for(const [id,name,table,cols,rec] of checks){const {error}=await supabase.from(table).select(cols).limit(1);if(error){add(id,name,'FAIL',error.message,rec);if(id!=='LOG-001')await safeLog(supabase,user.id,id,'self-test',error.message);}else add(id,name,'PASS',`${table} is readable with required columns.`);}
 const {data:e,error:ee}=await supabase.from('component_evidence').select('component_id, observation_id');
 if(ee)add('INT-001','Evidence integrity','FAIL',ee.message,'Verify Evidence table access.'); else {const bad=(e??[]).filter((r:any)=>!r.component_id||!r.observation_id).length;add('INT-001','Evidence integrity',bad?'WARN':'PASS',bad?`${bad} accessible evidence rows have missing relationship identifiers.`:'Evidence relationship identifiers are present.',bad?'Review incomplete Evidence rows.':undefined);}
 const {error:ex}=await supabase.from('debug_sessions').select('id').limit(1);add('EXP-001','Export prerequisites',ex?'FAIL':'PASS',ex?ex.message:'Authenticated export source queries are available.',ex?'Run database checks above first.':undefined);
 return {runId,startedAt,finishedAt:new Date().toISOString(),results};
}
