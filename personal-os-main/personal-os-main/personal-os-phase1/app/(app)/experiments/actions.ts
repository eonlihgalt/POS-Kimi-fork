'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

const allowedStatuses = new Set([
  'draft',
  'active',
  'completed',
  'abandoned'
]);

const allowedConclusions = new Set([
  'supported',
  'mixed',
  'not_supported',
  'inconclusive'
]);

export async function createExperiment(formData: FormData) {
  const title = String(formData.get('title') || '').trim();
  const hypothesis = String(formData.get('hypothesis') || '').trim();
  const variableChange = String(
    formData.get('variableChange') || ''
  ).trim();
  const successCriteria = String(
    formData.get('successCriteria') || ''
  ).trim();

  if (!title || !hypothesis || !variableChange) {
    throw new Error(
      'Title, hypothesis, and variable change are required.'
    );
  }

  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: workspace, error: workspaceError } = await supabase
    .from('workspaces')
    .select('id')
    .eq('owner_id', user.id)
    .order('created_at', { ascending: true })
    .limit(1)
    .single();

  if (workspaceError || !workspace) {
    throw new Error('Workspace unavailable.');
  }

  const { error } = await supabase
    .from('experiments')
    .insert({
      workspace_id: workspace.id,
      title,
      hypothesis,
      variable_change: variableChange,
      success_criteria: successCriteria || null,
      status: 'draft'
    });

  if (error) {
    console.error('Experiment creation failed', error);
    throw new Error('Unable to create experiment.');
  }

  revalidatePath('/experiments');
  redirect('/experiments');
}

export async function updateExperimentStatus(formData: FormData) {
  const experimentId = String(
    formData.get('experimentId') || ''
  ).trim();
  const status = String(formData.get('status') || '').trim();
  const conclusion = String(
    formData.get('conclusion') || ''
  ).trim();

  if (!experimentId || !allowedStatuses.has(status)) {
    throw new Error('Invalid experiment status update.');
  }

  if (conclusion && !allowedConclusions.has(conclusion)) {
    throw new Error('Invalid experiment conclusion.');
  }

  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const now = new Date().toISOString();
  const update: Record<string, string | null> = {
    status,
    updated_at: now
  };

  if (status === 'active') {
    update.started_at = now;
    update.completed_at = null;
  }

  if (status === 'completed' || status === 'abandoned') {
    update.completed_at = now;
  }

  if (status === 'completed') {
    update.conclusion = conclusion || 'inconclusive';
  } else {
    update.conclusion = null;
  }

  const { error } = await supabase
    .from('experiments')
    .update(update)
    .eq('id', experimentId);

  if (error) {
    console.error('Experiment status update failed', error);
    throw new Error('Unable to update experiment.');
  }

  revalidatePath('/experiments');
}
