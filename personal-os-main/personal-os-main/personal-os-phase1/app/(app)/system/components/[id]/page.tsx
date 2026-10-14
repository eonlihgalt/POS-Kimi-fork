import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import {
  updateComponentConfidence,
  updateComponentDetails,
  updateComponentStatus,
  assignTag,
  createTagAndAssign,
  removeTag,
  createRelationship,
  removeRelationship
} from './actions';

function suggestedConfidence(
  evidenceCount: number
): 'low' | 'medium' | 'high' {
  if (evidenceCount >= 6) return 'high';
  if (evidenceCount >= 3) return 'medium';
  return 'low';
}

const lifecycleOptions: Record<
  string,
  string[]
> = {
  observed: ['candidate', 'retired'],
  candidate: ['testing', 'retired'],
  testing: [
    'confirmed',
    'adopted',
    'candidate',
    'retired'
  ],
  confirmed: [
    'testing',
    'deprecated'
  ],
  adopted: [
    'deprecated'
  ],
  deprecated: [
    'adopted',
    'retired'
  ],
  retired: ['candidate']
};

export default async function ComponentDetail({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createClient();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const {
    data: component,
    error: componentError
  } = await supabase
    .from('components')
    .select('*')
    .eq('id', id)
    .single();

  if (componentError || !component) {
    notFound();
  }

  const {
    data: evidence,
    error: evidenceError
  } = await supabase
    .from('component_evidence')
    .select(
      'id,strength'
    )
    .eq('component_id', id);

  if (evidenceError) {
    throw new Error(
      'Unable to load Component evidence.'
    );
  }

  const {
    data: tags
  } = await supabase
    .from('component_tags')
    .select(`
      tag_id,
      tags (
        id,
        name
      )
    `)
    .eq('component_id', id);

  const {
    data: allTags
  } = await supabase
    .from('tags')
    .select('id,name')
    .order('name');

  const {
    data: relationships
  } = await supabase
    .from('component_links')
    .select(
      'id, relationship_type, notes, target_component_id'
    )
    .eq(
      'source_component_id',
      component.id
    );

  const {
    data: availableComponents
  } = await supabase
    .from('components')
    .select('id,title')
    .neq('id', component.id)
    .order('title');

  const relationshipTargetLookup =
    new Map(
      (availableComponents ?? []).map(
        (target: any) => [
          target.id,
          target.title
        ]
      )
    );

  const evidenceCount =
    evidence?.length ?? 0;

  const suggestion =
    suggestedConfidence(evidenceCount);

  const currentConfidence =
    component.confidence ?? 'low';

  const suggestionDiffers =
    suggestion !== currentConfidence;

  const availableTransitions =
    lifecycleOptions[
      component.status
    ] ?? [];

  return (
    <main>
      <p>
        <Link href="/system/components">
          Back to Components
        </Link>
      </p>

      <h1>{component.title}</h1>

      <p>
        <strong>Type:</strong>{' '}
        {component.type}
      </p>

      <p>
        <strong>Status:</strong>{' '}
        {component.status}
      </p>

      <p>
        <strong>Evidence Count:</strong>{' '}
        {evidenceCount}
      </p>

      <section>
        <h2>Edit Component</h2>

        <form
          action={
            updateComponentDetails
          }
        >
          <input
            type="hidden"
            name="componentId"
            value={component.id}
          />

          <p>
            <label>
              Title
              <br />
              <input
                type="text"
                name="title"
                defaultValue={
                  component.title
                }
                required
              />
            </label>
          </p>

          <p>
            <label>
              Category
              <br />
              <input
                type="text"
                name="category"
                defaultValue={
                  component.category ??
                  ''
                }
              />
            </label>
          </p>

          <p>
            <label>
              Description
              <br />
              <textarea
                name="description"
                rows={4}
                defaultValue={
                  component.description ??
                  ''
                }
              />
            </label>
          </p>

          <p>
            <label>
              Helpful When
              <br />
              <textarea
                name="helpfulWhen"
                rows={4}
                defaultValue={
                  component.helpful_when ??
                  ''
                }
              />
            </label>
          </p>

          <p>
            <label>
              Costly When
              <br />
              <textarea
                name="costlyWhen"
                rows={4}
                defaultValue={
                  component.costly_when ??
                  ''
                }
              />
            </label>
          </p>

          <button type="submit">
            Save Changes
          </button>
        </form>
      </section>

      <section>
        <h2>Lifecycle</h2>

        <p>
          <strong>
            Current Status:
          </strong>{' '}
          {component.status}
        </p>

        {availableTransitions.length >
        0 ? (
          <form
            action={
              updateComponentStatus
            }
          >
            <input
              type="hidden"
              name="componentId"
              value={component.id}
            />

            <select name="status">
              {availableTransitions.map(
                (status) => (
                  <option
                    key={status}
                    value={status}
                  >
                    {status}
                  </option>
                )
              )}
            </select>

            <button type="submit">
              Update Status
            </button>
          </form>
        ) : (
          <p>
            No transitions
            available.
          </p>
        )}
      </section>

      <section>
        <h2>
          Confidence Review
        </h2>

        <p>
          Suggested: {suggestion}
        </p>

        {suggestionDiffers && (
          <form
            action={
              updateComponentConfidence
            }
          >
            <input
              type="hidden"
              name="componentId"
              value={component.id}
            />

            <button
              type="submit"
              name="confidence"
              value={suggestion}
            >
              Change confidence to{' '}
              {suggestion}
            </button>
          </form>
        )}
      </section>
      <section>
  <h2>Tags</h2>

  {(tags ?? []).length === 0 ? (
    <p>No tags assigned.</p>
  ) : (
    <>
      {(tags ?? []).map(
        (row: any) => (
          <form
            key={row.tag_id}
            action={removeTag}
          >
            <input
              type="hidden"
              name="componentId"
              value={component.id}
            />

            <input
              type="hidden"
              name="tagId"
              value={row.tag_id}
            />

            <span>
              {row.tags?.name}
            </span>

            {' '}

            <button type="submit">
              Remove
            </button>
          </form>
        )
      )}
    </>
  )}

  <h3>Assign Existing Tag</h3>

  <form action={assignTag}>
    <input
      type="hidden"
      name="componentId"
      value={component.id}
    />

    <select name="tagId">
      {(allTags ?? []).map(
        (row: any) => (
          <option
            key={row.id}
            value={row.id}
          >
            {row.name}
          </option>
        )
      )}
    </select>

    <button type="submit">
      Assign
    </button>
  </form>

  <h3>Create New Tag</h3>

  <form action={createTagAndAssign}>
    <input
      type="hidden"
      name="componentId"
      value={component.id}
    />

    <input
      type="text"
      name="tagName"
      required
    />

    <button type="submit">
      Create + Assign
    </button>
  </form>
</section>

<section>
  <h2>Relationships</h2>

  {(relationships ?? []).length === 0 ? (
    <p>
      No relationships defined.
    </p>
  ) : (
    <>
      {(relationships ?? []).map(
        (relationship: any) => (
          <form
            key={relationship.id}
            action={removeRelationship}
          >
            <input
              type="hidden"
              name="relationshipId"
              value={relationship.id}
            />

            <input
              type="hidden"
              name="componentId"
              value={component.id}
            />

            <strong>
              {
                relationship.relationship_type
              }
            </strong>

            {' → '}

            {
              relationshipTargetLookup.get(
                relationship.target_component_id
              ) ??
              relationship.target_component_id
            }

            {relationship.notes ? (
              <p>
                {relationship.notes}
              </p>
            ) : null}

            <button type="submit">
              Remove
            </button>
          </form>
        )
      )}
    </>
  )}

  <h3>
    Create Relationship
  </h3>

  <form
    action={createRelationship}
  >
    <input
      type="hidden"
      name="componentId"
      value={component.id}
    />

    <p>
      <select
        name="relationshipType"
      >
        <option value="triggers">
          triggers
        </option>

        <option value="requires">
          requires
        </option>

        <option value="supports">
          supports
        </option>

        <option value="conflicts_with">
          conflicts_with
        </option>

        <option value="protects_against">
          protects_against
        </option>

        <option value="amplifies">
          amplifies
        </option>

        <option value="reduces">
          reduces
        </option>

        <option value="compensates_for">
          compensates_for
        </option>

        <option value="replaced_by">
          replaced_by
        </option>
      </select>
    </p>

    <p>
      <select
        name="targetComponentId"
      >
        {(availableComponents ?? [])
          .map(
            (
              target: any
            ) => (
              <option
                key={target.id}
                value={target.id}
              >
                {target.title}
              </option>
            )
          )}
      </select>
    </p>

    <p>
      <textarea
        name="notes"
        rows={3}
      />
    </p>

    <button type="submit">
      Create Relationship
    </button>
  </form>
</section>
      
      
    </main>
  );
}
