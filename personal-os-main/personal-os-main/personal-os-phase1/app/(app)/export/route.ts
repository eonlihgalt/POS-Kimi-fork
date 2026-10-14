import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const [a,b,c,d] = await Promise.all([
    supabase.from('debug_sessions').select('*').order('created_at'),
    supabase.from('observations').select('*').order('created_at'),
    supabase.from('components').select('*').order('created_at'),
    supabase.from('component_evidence').select('*').order('created_at')
  ]);
  const error = a.error ?? b.error ?? c.error ?? d.error;
  if (error) return NextResponse.json({ error: 'Unable to export Personal OS data.' }, { status: 500 });
  const exportedAt = new Date().toISOString();
  return new NextResponse(JSON.stringify({format:'personal-os-export',formatVersion:1,exportedAt,userId:user.id,data:{debugSessions:a.data??[],observations:b.data??[],components:c.data??[],componentEvidence:d.data??[]}}, null, 2), {headers:{'Content-Type':'application/json; charset=utf-8','Content-Disposition':`attachment; filename="personal-os-export-${exportedAt.slice(0,10)}.json"`,'Cache-Control':'no-store'}});
}
