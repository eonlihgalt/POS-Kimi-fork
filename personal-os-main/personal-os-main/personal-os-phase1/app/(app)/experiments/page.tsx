import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { updateExperimentStatus } from './actions';

const statuses = [
  'draft',
  'active',
  'completed',
  'abandoned'
];

export default async function ExperimentsPage() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: experiments, error } = await supabase
    .from('experiments')
    .select(
      'id,title,hypothesis,variable_change,success_criteria,status,conclusion,started_at,completed_at,created_at'
    )
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Experiment list lookup failed', error);
    throw new Error('Unable to load experiments.');
  }

  return (
    <main>
      <p>PERSONAL OS · EXPERIMENTS</p>
      <h1>Experiments</h1>

      <p>
        Test deliberate changes against a clear hypothesis and success
        criteria.
      </p>

      <p>
        <Link href="/experiments/new">Create Experiment</Link>
      </p>

      {(experiments ?? []).length === 0 ? (
        <p>No experiments yet.</p>
      ) : (
        (experiments ?? []).map((experiment) => (
          <article
            key={experiment.id}
            style={{ marginBottom: 32 }}
          >
            <h2>{experiment.title}</h2>

            <p>
              <strong>Status:</strong> {experiment.status}
            </p>

            <p>
              <strong>Hypothesis:</strong> {experiment.hypothesis}
            </p>

            <p>
              <strong>Variable change:</strong>{' '}
              {experiment.variable_change}
            </p>

            <p>
              <strong>Success criteria:</strong>{' '}
              {experiment.success_criteria || 'Not defined'}
            </p>

            {experiment.conclusion ? (
              <p>
                <strong>Conclusion:</strong> {experiment.conclusion}
              </p>
            ) : null}

            <form action={updateExperimentStatus}>
              <input
                type="hidden"
                name="experimentId"
                value={experiment.id}
              />

              <label>
                Status
                <br />
                <select
                  name="status"
                  defaultValue={experiment.status}
                >
                  {statuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </label>

              <p>
                <label>
                  Conclusion
                  <br />
                  <select
                    name="conclusion"
                    defaultValue={experiment.conclusion ?? ''}
                  >
                    <option value="">Not set</option>
                    <option value="supported">supported</option>
                    <option value="mixed">mixed</option>
                    <option value="not_supported">
                      not_supported
                    </option>
                    <option value="inconclusive">
                      inconclusive
                    </option>
                  </select>
                </label>
              </p>

              <button type="submit">Save Experiment</button>
            </form>
          </article>
        ))
      )}
    </main>
  );
}
