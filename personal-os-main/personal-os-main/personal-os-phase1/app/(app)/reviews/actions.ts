'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

function readRequiredDate(formData: FormData, name: string) {
  const value = String(formData.get(name) || '').trim();

  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error(`Invalid ${name}.`);
  }

  return value;
}

export async function createWeeklyReview(formData: FormData) {
  const periodStart = readRequiredDate(formData, 'periodStart');
  const periodEnd = readRequiredDate(formData, 'periodEnd');
  const wins = String(formData.get('wins') || '').trim();
  const challenges = String(formData.get('challenges') || '').trim();
  const versionNotes = String(
    formData.get('versionNotes') || ''
  ).trim();

  if (periodEnd < periodStart) {
    throw new Error('Period end must be on or after period start.');
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
    .from('weekly_reviews')
    .insert({
      workspace_id: workspace.id,
      period_start: periodStart,
      period_end: periodEnd,
      wins: wins || null,
      challenges: challenges || null,
      version_notes: versionNotes || null
    });

  if (error) {
    console.error('Weekly review creation failed', error);
    throw new Error('Unable to create weekly review.');
  }

  revalidatePath('/reviews');
  redirect('/reviews');
}
