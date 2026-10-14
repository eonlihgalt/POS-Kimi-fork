import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC'
  }).format(new Date(`${value}T00:00:00Z`));
}

export default async function WeeklyReviewsPage() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: reviews, error } = await supabase
    .from('weekly_reviews')
    .select(
      'id,period_start,period_end,wins,challenges,version_notes,created_at'
    )
    .order('period_start', { ascending: false });

  if (error) {
    console.error('Weekly review list lookup failed', error);
    throw new Error('Unable to load weekly reviews.');
  }

  return (
    <main>
      <p>PERSONAL OS · WEEKLY REVIEWS</p>
      <h1>Weekly Reviews</h1>

      <p>
        Capture wins, challenges, and version notes for each review period.
      </p>

      <p>
        <Link href="/reviews/new">Create Weekly Review</Link>
      </p>

      {(reviews ?? []).length === 0 ? (
        <p>No weekly reviews yet.</p>
      ) : (
        (reviews ?? []).map((review) => (
          <article
            key={review.id}
            style={{ marginBottom: 32 }}
          >
            <h2>
              {formatDate(review.period_start)} through{' '}
              {formatDate(review.period_end)}
            </h2>

            <section>
              <h3>Wins</h3>
              <p>{review.wins || 'No wins recorded.'}</p>
            </section>

            <section>
              <h3>Challenges</h3>
              <p>{review.challenges || 'No challenges recorded.'}</p>
            </section>

            <section>
              <h3>Version Notes</h3>
              <p>{review.version_notes || 'No version notes recorded.'}</p>
            </section>
          </article>
        ))
      )}
    </main>
  );
}
