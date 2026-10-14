import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export default async function DebugDetail({params}:{params:Promise<{id:string}>}) {
  const {id}=await params;
  const supabase=await createClient();
  const {data:{user}}=await supabase.auth.getUser();
  if(!user) redirect('/login');
  const {data}=await supabase.from('debug_sessions').select('*').eq('id',id).single();
  if(!data) notFound();
  const fields=[['Trigger',data.trigger],['Thoughts',data.thoughts],['Emotions',data.emotions],['Behavior',data.behavior],['Outcome',data.outcome]] as const;
  return <main>
    <p>PERSONAL OS · DEBUG SESSION</p>
    <h1>{data.title || 'Saved observation'}</h1>
    <h2>Situation</h2><p>{data.situation}</p>
    {fields.map(([label,value])=>value ? <section key={label}><h3>{label}</h3><p>{value}</p></section> : null)}
    <p><strong>Analysis lens:</strong> {data.analysis_lens}</p>
    <p>✓ Persisted to Personal OS</p>
    {data.status !== 'completed' ? <Link href={`/debug/${data.id}/analyze`}>Analyze this observation →</Link> : <p>✓ Analysis completed</p>}
  </main>;
}
