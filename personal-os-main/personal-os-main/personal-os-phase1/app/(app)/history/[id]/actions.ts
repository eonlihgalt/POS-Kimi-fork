'use server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

async function requireUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  return supabase;
}

export async function archiveDebugSession(formData: FormData) {
  const id = String(formData.get('debugSessionId') || '').trim();
  if (!id) throw new Error('Invalid Debug Session.');
  const supabase = await requireUser();
  const { data: session } = await supabase.from('debug_sessions').select('id').eq('id', id).single();
  if (!session) throw new Error('Debug Session unavailable.');
  const { error } = await supabase.from('debug_sessions').update({ archived_at: new Date().toISOString() }).eq('id', id);
  if (error) throw new Error('Unable to archive Debug Session.');
  revalidatePath('/history'); revalidatePath(`/history/${id}`);
}

export async function restoreDebugSession(formData: FormData) {
  const id = String(formData.get('debugSessionId') || '').trim();
  if (!id) throw new Error('Invalid Debug Session.');
  const supabase = await requireUser();
  const { data: session } = await supabase.from('debug_sessions').select('id').eq('id', id).single();
  if (!session) throw new Error('Debug Session unavailable.');
  const { error } = await supabase.from('debug_sessions').update({ archived_at: null }).eq('id', id);
  if (error) throw new Error('Unable to restore Debug Session.');
  revalidatePath('/history'); revalidatePath(`/history/${id}`);
}

export async function permanentlyDeleteDebugSession(formData: FormData) {
  const id = String(formData.get('debugSessionId') || '').trim();
  const confirmation = String(formData.get('confirmation') || '').trim();
  if (!id || confirmation !== 'DELETE') throw new Error('Deletion confirmation failed.');
  const supabase = await requireUser();
  const { data: session, error: sessionError } = await supabase.from('debug_sessions').select('id').eq('id', id).single();
  if (sessionError || !session) throw new Error('Debug Session unavailable.');
  const { data: observations, error: observationError } = await supabase.from('observations').select('id').eq('debug_session_id', id);
  if (observationError) throw new Error('Unable to inspect derived observations.');
  const ids = (observations ?? []).map((row) => row.id);
  if (ids.length > 0) {
    const { error: evidenceError } = await supabase.from('component_evidence').delete().in('observation_id', ids);
    if (evidenceError) throw new Error('Unable to remove derived evidence.');
    const { error: observationDeleteError } = await supabase.from('observations').delete().in('id', ids);
    if (observationDeleteError) throw new Error('Unable to remove derived observations.');
  }
  const { error: sessionDeleteError } = await supabase.from('debug_sessions').delete().eq('id', id);
  if (sessionDeleteError) throw new Error('Unable to permanently delete Debug Session.');
  revalidatePath('/history'); revalidatePath('/system/components');
  redirect('/history');
}
