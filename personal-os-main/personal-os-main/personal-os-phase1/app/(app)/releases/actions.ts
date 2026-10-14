'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export async function createRelease(formData: FormData) {
  const version = String(formData.get('version') || '').trim();
  const title = String(formData.get('title') || '').trim();
  const summary = String(formData.get('summary') || '').trim();

  if (!version) {
    throw new Error('Version is required.');
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
    .from('releases')
    .insert({
      workspace_id: workspace.id,
      version,
      title: title || null,
      summary: summary || null
    });

  if (error) {
    console.error('Release creation failed', error);

    if (error.code === '23505') {
      throw new Error('That release version already exists.');
    }

    throw new Error('Unable to create release.');
  }

  revalidatePath('/releases');
  redirect('/releases');
}
