'use client';

import { useMemo, useState } from 'react';
import { saveDiscovery } from './actions';

type ExistingComponent = {
  id: string;
  type: string;
  title: string;
  confidence: string | null;
  evidenceCount: number;
};

export default function DiscoveryForm({
  debugSessionId,
  analysisLens,
  components
}: {
  debugSessionId: string;
  analysisLens: string;
  components: ExistingComponent[];
}) {
  const [type, setType] = useState(analysisLens === 'protective' ? 'need' : 'setting');
  const [title, setTitle] = useState('');
  const [checked, setChecked] = useState(false);

  const match = useMemo(() => {
    const normalizedTitle = title.trim().toLowerCase();
    if (!normalizedTitle) return null;
    return components.find(
      (component) => component.type === type && component.title.trim().toLowerCase() === normalizedTitle
    ) ?? null;
  }, [components, title, type]);

  function resetCheck() {
    setChecked(false);
  }

  return (
    <form action={saveDiscovery}>
      <input type="hidden" name="debugSessionId" value={debugSessionId} />

      <label>
        Discovery type
        <br />
        <select
          name="type"
          value={type}
          onChange={(event) => {
            setType(event.target.value);
            resetCheck();
          }}
        >
          <option value="setting">Setting</option>
          <option value="rule">Rule</option>
          <option value="assumption">Assumption</option>
          <option value="need">Need</option>
          <option value="protective_strategy">Protective strategy</option>
          <option value="strength">Strength</option>
          <option value="warning_sign">Warning sign</option>
          <option value="recovery_method">Recovery method</option>
          <option value="resource_requirement">Resource requirement</option>
          <option value="operating_condition">Operating condition</option>
        </select>
      </label>

      <br />
      <br />

      <label>
        Name
        <br />
        <input
          name="title"
          required
          maxLength={160}
          value={title}
          onChange={(event) => {
            setTitle(event.target.value);
            resetCheck();
          }}
        />
      </label>

      <br />
      <br />

      <label>
        What did you observe?
        <br />
        <textarea name="description" rows={5} />
      </label>

      <br />
      <br />

      <label>
        Confidence
        <br />
        <select name="confidence" defaultValue="low">
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </label>

      <br />
      <br />

      {!checked ? (
        <button type="button" onClick={() => setChecked(true)} disabled={title.trim().length < 2}>
          Check for existing component
        </button>
      ) : match ? (
        <section>
          <h2>Possible existing component</h2>
          <p><strong>{match.title}</strong></p>
          <p><strong>Type:</strong> {match.type}</p>
          <p><strong>Confidence:</strong> {match.confidence ?? 'not set'}</p>
          <p><strong>Evidence Count:</strong> {match.evidenceCount}</p>

          <button type="submit" name="existingComponentId" value={match.id}>
            Add evidence to this component
          </button>{' '}
          <button type="submit" name="createSeparate" value="true">
            Create a separate component
          </button>{' '}
          <button type="button" onClick={() => setChecked(false)}>
            Back to analysis
          </button>
        </section>
      ) : (
        <section>
          <p>No matching component found.</p>
          <button type="submit" name="createSeparate" value="true">
            Create candidate + evidence
          </button>{' '}
          <button type="button" onClick={() => setChecked(false)}>
            Back to analysis
          </button>
        </section>
      )}
    </form>
  );
}
