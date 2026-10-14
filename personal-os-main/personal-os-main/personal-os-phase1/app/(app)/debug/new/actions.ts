'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { debugSessionSchema } from '@/lib/validation/debug-session';

export async function createDebugSession(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const parsed = debugSessionSchema.safeParse({
    situation: formData.get('situation'),
    trigger: formData.get('trigger') || undefined,
    thoughts: formData.get('thoughts') || undefined,
    emotions: formData.get('emotions') || undefined,
    behavior: formData.get('behavior') || undefined,
    outcome: formData.get('outcome') || undefined,
    analysisLens: formData.get('analysisLens') || 'standard'
  });

  if (!parsed.success) {
    throw new Error(
      parsed.error.issues[0]?.message ?? 'Invalid debug session.'
    );
  }

  // Find the Personal OS workspace owned by this user.
  const {
    data: workspace,
    error: workspaceError
  } = await supabase
    .from('workspaces')
    .select('id')
    .eq('owner_id', user.id)
    .limit(1)
    .single();

  if (workspaceError || !workspace) {
    console.error('Workspace lookup failed', {
      userId: user.id,
      error: workspaceError
    });

    throw new Error('No Personal OS workspace found.');
  }

  const p = parsed.data;

  // Save the Debug Session into the authenticated user's workspace.
  const {
    data,
    error
  } = await supabase
    .from('debug_sessions')
    .insert({
      workspace_id: workspace.id,
      situation: p.situation,
      trigger: p.trigger ?? null,
      thoughts: p.thoughts ?? null,
      emotions: p.emotions ?? null,
      behavior: p.behavior ?? null,
      outcome: p.outcome ?? null,
      analysis_lens: p.analysisLens,
      status: 'analysis',
      occurred_at: new Date().toISOString()
    })
    .select('id')
    .single();

  if (error) {
    console.error('Debug Session insert failed', {
      userId: user.id,
      workspaceId: workspace.id,
      error
    });

    throw new Error('Unable to save Debug Session.');
  }

  redirect(`/debug/${data.id}`);
}
