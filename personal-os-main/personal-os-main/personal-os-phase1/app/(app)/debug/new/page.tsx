import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createDebugSession } from './actions';
const box={width:'100%',padding:12,margin:'6px 0 18px',boxSizing:'border-box' as const};
export default async function NewDebug(){
 const supabase=await createClient(); const {data:{user}}=await supabase.auth.getUser(); if(!user) redirect('/login');
 return <main><p>PERSONAL OS · BEHAVIORAL DEBUGGER</p><h1>Debug something</h1><p>Let's examine what happened without deciding what it means yet.</p><form action={createDebugSession}><label>Situation<br/><textarea name="situation" required rows={5} style={box}/></label><label>Trigger<br/><textarea name="trigger" rows={3} style={box}/></label><h2>System response</h2><label>Thoughts<br/><textarea name="thoughts" rows={3} style={box}/></label><label>Emotions<br/><textarea name="emotions" rows={2} style={box}/></label><label>Behavior<br/><textarea name="behavior" rows={3} style={box}/></label><label>Outcome<br/><textarea name="outcome" rows={3} style={box}/></label><fieldset><legend>Analysis lens</legend><label><input type="radio" name="analysisLens" value="standard" defaultChecked/> Standard</label> <label><input type="radio" name="analysisLens" value="protective"/> Protective</label> <label><input type="radio" name="analysisLens" value="both"/> Both</label></fieldset><p><button type="submit">Save & continue →</button></p></form></main>;
}
