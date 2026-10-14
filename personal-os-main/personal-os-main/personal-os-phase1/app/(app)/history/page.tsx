import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export default async function HistoryPage({ searchParams }: { searchParams: Promise<{ archived?: string }> }) {
  const { archived } = await searchParams;
  const showArchived = archived === '1';
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  let query = supabase.from('debug_sessions')
    .select('id, situation, trigger, analysis_lens, status, occurred_at, created_at, archived_at')
    .order('created_at', { ascending: false });
  query = showArchived ? query.not('archived_at', 'is', null) : query.is('archived_at', null);
  const { data: sessions, error } = await query;
  if (error) throw new Error('Unable to load History.');

  return (
    <main>
      <p>PERSONAL OS · HISTORY</p>
      <h1>{showArchived ? 'Archived history' : 'Your history'}</h1>
      <p>{showArchived ? 'Archived Debug Sessions remain stored and can be restored.' : 'Review your Debug Sessions and inspect their impact.'}</p>
      <p>{showArchived ? <Link href="/history">View active history</Link> : <Link href="/history?archived=1">View archived history</Link>}</p>
      {(sessions ?? []).length === 0 ? <p>No Debug Sessions in this view.</p> : null}
      {(sessions ?? []).map((session) => {
        const date = session.occurred_at ?? session.created_at;
        return (
          <article key={session.id} style={{ marginBottom: 28 }}>
            <h2><Link href={`/debug/${session.id}`}>{session.situation}</Link></h2>
            {date ? <p><strong>Date:</strong> {new Date(date).toLocaleString()}</p> : null}
            <p><strong>Status:</strong> {session.status}</p>
            <p><strong>Lens:</strong> {session.analysis_lens}</p>
            {session.trigger ? <p><strong>Trigger:</strong> {session.trigger}</p> : null}
            {session.archived_at ? <p><strong>Archived:</strong> {new Date(session.archived_at).toLocaleString()}</p> : null}
            <p><Link href={`/debug/${session.id}`}>View Debug Session</Link></p>
            <p><Link href={`/history/${session.id}`}>Review input impact and data control</Link></p>
          </article>
        );
      })}
    </main>
  );
}
