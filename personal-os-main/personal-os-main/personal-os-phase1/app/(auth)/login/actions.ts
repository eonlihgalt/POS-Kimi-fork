'use server';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
export async function signIn(formData: FormData) {
  const email=String(formData.get('email')||'').trim(); const password=String(formData.get('password')||'');
  const supabase=await createClient(); const {error}=await supabase.auth.signInWithPassword({email,password});
  if(error) redirect('/login?error=signin'); redirect('/debug/new');
}
export async function signUp(formData: FormData) {
  const email=String(formData.get('email')||'').trim(); const password=String(formData.get('password')||'');
  const supabase=await createClient(); const {error}=await supabase.auth.signUp({email,password,options:{emailRedirectTo:`${process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'}/auth/confirm`}});
  if(error) redirect('/login?error=signup'); redirect('/login?message=check-email');
}
