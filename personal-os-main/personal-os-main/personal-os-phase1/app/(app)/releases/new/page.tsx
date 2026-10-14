import Link from 'next/link';
import { createRelease } from '../actions';

export default function NewReleasePage() {
  return (
    <main>
      <p>
        <Link href="/releases">Back to Releases</Link>
      </p>

      <h1>Create Release</h1>

      <form action={createRelease}>
        <p>
          <label>
            Version
            <br />
            <input
              type="text"
              name="version"
              placeholder="v0.1.011.0"
              required
            />
          </label>
        </p>

        <p>
          <label>
            Title
            <br />
            <input type="text" name="title" />
          </label>
        </p>

        <p>
          <label>
            Summary
            <br />
            <textarea name="summary" rows={8} />
          </label>
        </p>

        <button type="submit">Create Release</button>
      </form>
    </main>
  );
}
