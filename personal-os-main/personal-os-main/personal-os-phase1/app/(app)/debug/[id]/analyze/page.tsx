import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import DiscoveryForm from './DiscoveryForm';

export default async function Analyze({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: session, error: sessionError } = await supabase
    .from('debug_sessions')
    .select('id, workspace_id, analysis_lens, situation')
    .eq('id', id)
    .single();

  if (sessionError || !session) notFound();

  const { data: components, error: componentsError } = await supabase
    .from('components')
    .select('id, type, title, confidence')
    .eq('workspace_id', session.workspace_id)
    .order('created_at', { ascending: true });

  if (componentsError) {
    console.error('Component list lookup failed', { error: componentsError });
    throw new Error('Unable to load existing Components.');
  }

  const componentIds = (components ?? []).map((component) => component.id);
  let evidenceCounts = new Map<string, number>();

  if (componentIds.length > 0) {
    const { data: evidenceRows, error: evidenceError } = await supabase
      .from('component_evidence')
      .select('component_id')
      .in('component_id', componentIds);

    if (evidenceError) {
      console.error('Evidence count lookup failed', { error: evidenceError });
      throw new Error('Unable to load Component evidence counts.');
    }

    evidenceCounts = new Map<string, number>();
    for (const row of evidenceRows ?? []) {
      evidenceCounts.set(row.component_id, (evidenceCounts.get(row.component_id) ?? 0) + 1);
    }
  }

  const componentOptions = (components ?? []).map((component) => ({
    id: component.id,
    type: component.type,
    title: component.title,
    confidence: component.confidence,
    evidenceCount: evidenceCounts.get(component.id) ?? 0
  }));

  return (
    <main>
      <p>PERSONAL OS · ANALYSIS</p>
      <h1>What might be operating?</h1>
      <blockquote>{session.situation}</blockquote>
      <p><strong>Lens:</strong> {session.analysis_lens}</p>

      <DiscoveryForm
        debugSessionId={session.id}
        analysisLens={session.analysis_lens}
        components={componentOptions}
      />
    </main>
  );
}
