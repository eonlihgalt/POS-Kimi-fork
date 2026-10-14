import Link from 'next/link';
import { createExperiment } from '../actions';

export default function NewExperimentPage() {
  return (
    <main>
      <p>
        <Link href="/experiments">Back to Experiments</Link>
      </p>

      <h1>Create Experiment</h1>

      <form action={createExperiment}>
        <p>
          <label>
            Title
            <br />
            <input type="text" name="title" required />
          </label>
        </p>

        <p>
          <label>
            Hypothesis
            <br />
            <textarea name="hypothesis" rows={5} required />
          </label>
        </p>

        <p>
          <label>
            Variable Change
            <br />
            <textarea name="variableChange" rows={5} required />
          </label>
        </p>

        <p>
          <label>
            Success Criteria
            <br />
            <textarea name="successCriteria" rows={5} />
          </label>
        </p>

        <button type="submit">Create Experiment</button>
      </form>
    </main>
  );
}
