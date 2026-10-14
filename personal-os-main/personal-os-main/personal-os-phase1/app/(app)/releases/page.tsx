import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

function formatReleaseDate(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  }).format(new Date(value));
}

export default async function ReleasesPage() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: releases, error } = await supabase
    .from('releases')
    .select('id,version,title,summary,released_at')
    .order('released_at', { ascending: false });

  if (error) {
    console.error('Release history lookup failed', error);
    throw new Error('Unable to load release history.');
  }

  return (
    <main>
      <p>PERSONAL OS · RELEASES</p>
      <h1>Releases and Versioning</h1>

      <p>
        Record named versions of the system and preserve a readable release
        history.
      </p>

      <p>
        <Link href="/releases/new">Create Release</Link>
      </p>

      {(releases ?? []).length === 0 ? (
        <p>No releases yet.</p>
      ) : (
        (releases ?? []).map((release) => (
          <article
            key={release.id}
            style={{ marginBottom: 32 }}
          >
            <h2>
              {release.version}
              {release.title ? ` · ${release.title}` : ''}
            </h2>

            <p>
              <strong>Released:</strong>{' '}
              {formatReleaseDate(release.released_at)}
            </p>

            <p>{release.summary || 'No summary recorded.'}</p>
          </article>
        ))
      )}
    </main>
  );
}
