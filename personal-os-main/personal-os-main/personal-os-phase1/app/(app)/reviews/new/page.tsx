import Link from 'next/link';
import { createWeeklyReview } from '../actions';

export default function NewWeeklyReviewPage() {
  return (
    <main>
      <p>
        <Link href="/reviews">Back to Weekly Reviews</Link>
      </p>

      <h1>Create Weekly Review</h1>

      <form action={createWeeklyReview}>
        <p>
          <label>
            Period Start
            <br />
            <input type="date" name="periodStart" required />
          </label>
        </p>

        <p>
          <label>
            Period End
            <br />
            <input type="date" name="periodEnd" required />
          </label>
        </p>

        <p>
          <label>
            Wins
            <br />
            <textarea name="wins" rows={6} />
          </label>
        </p>

        <p>
          <label>
            Challenges
            <br />
            <textarea name="challenges" rows={6} />
          </label>
        </p>

        <p>
          <label>
            Version Notes
            <br />
            <textarea name="versionNotes" rows={6} />
          </label>
        </p>

        <button type="submit">Create Weekly Review</button>
      </form>
    </main>
  );
}
