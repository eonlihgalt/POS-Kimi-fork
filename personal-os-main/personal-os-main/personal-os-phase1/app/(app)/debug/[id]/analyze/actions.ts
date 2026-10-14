'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { discoverySchema } from '@/lib/validation/discovery';

export async function saveDiscovery(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const parsed = discoverySchema.safeParse({
    debugSessionId: formData.get('debugSessionId'),
    type: formData.get('type'),
    title: formData.get('title'),
    description: formData.get('description') || undefined,
    confidence: formData.get('confidence')
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? 'Invalid discovery.');
  }

  const d = parsed.data;
  const requestedComponentId = String(formData.get('existingComponentId') || '').trim();
  const createSeparate = formData.get('createSeparate') === 'true';

  const { data: session, error: sessionError } = await supabase
    .from('debug_sessions')
    .select('id, workspace_id, occurred_at')
    .eq('id', d.debugSessionId)
    .single();

  if (sessionError || !session) {
    console.error('Debug Session lookup failed', { error: sessionError });
    throw new Error('Debug session unavailable.');
  }

  let componentId: string;

  if (requestedComponentId && !createSeparate) {
    const { data: existing, error: existingError } = await supabase
      .from('components')
      .select('id, type, title')
      .eq('id', requestedComponentId)
      .eq('workspace_id', session.workspace_id)
      .single();

    if (existingError || !existing) {
      console.error('Requested Component lookup failed', { error: existingError });
      throw new Error('Existing Component unavailable.');
    }

    if (existing.type !== d.type || existing.title.trim().toLowerCase() !== d.title.trim().toLowerCase()) {
      throw new Error('Existing Component no longer matches this discovery.');
    }

    componentId = existing.id;
  } else {
    const { data: newComponent, error: componentError } = await supabase
      .from('components')
      .insert({
        workspace_id: session.workspace_id,
        type: d.type,
        title: d.title,
        description: d.description ?? null,
        status: 'candidate',
        confidence: d.confidence,
        first_observed_at: session.occurred_at ?? new Date().toISOString(),
        last_observed_at: session.occurred_at ?? new Date().toISOString()
      })
      .select('id')
      .single();

    if (componentError || !newComponent) {
      console.error('Component creation failed', { error: componentError });
      throw new Error('Unable to create Component.');
    }

    componentId = newComponent.id;
  }

  const { data: observation, error: observationError } = await supabase
    .from('observations')
    .insert({
      workspace_id: session.workspace_id,
      debug_session_id: session.id,
      observation_type: 'pattern',
      content: d.description || d.title,
      occurred_at: session.occurred_at
    })
    .select('id')
    .single();

  if (observationError || !observation) {
    console.error('Observation creation failed', { error: observationError });
    throw new Error('Unable to create Observation.');
  }

  const { error: evidenceError } = await supabase
    .from('component_evidence')
    .insert({
      component_id: componentId,
      observation_id: observation.id,
      strength: d.confidence === 'high' ? 'strong' : d.confidence === 'medium' ? 'moderate' : 'weak'
    });

  if (evidenceError) {
    console.error('Evidence creation failed', { error: evidenceError });
    throw new Error('Unable to create Evidence.');
  }

  const { error: sessionUpdateError } = await supabase
    .from('debug_sessions')
    .update({ status: 'completed' })
    .eq('id', session.id);

  if (sessionUpdateError) {
    console.error('Debug Session completion failed', { error: sessionUpdateError });
    throw new Error('Unable to complete Debug Session.');
  }

  redirect(`/system/components/${componentId}`);
}
