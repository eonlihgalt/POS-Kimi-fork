import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

const typeLabels: Record<string, string> = {
  setting: 'Settings',
  rule: 'Rules',
  assumption: 'Assumptions',
  need: 'Needs',
  protective_strategy: 'Protective Strategies',
  strength: 'Strengths',
  warning_sign: 'Warning Signs',
  recovery_method: 'Recovery Methods',
  resource_requirement: 'Resource Requirements',
  operating_condition: 'Operating Conditions'
};

export default async function ComponentsIndex({
  searchParams
}: {
  searchParams: Promise<{
    q?: string;
    type?: string;
    status?: string;
    confidence?: string;
    tag?: string;
    sort?: string;
  }>;
}) {
  const params = await searchParams;

  const q = (params.q ?? '').trim().toLowerCase();

  const typeFilter = params.type ?? '';

  const statusFilter = params.status ?? '';

  const confidenceFilter =
    params.confidence ?? '';

  const tagFilter =
    params.tag ?? '';

  const sort =
    params.sort ?? 'created';

  const supabase = await createClient();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const {
    data: components,
    error: componentError
  } = await supabase
    .from('components')
    .select(
      'id, type, title, status, confidence, created_at'
    )
    .order('created_at', {
      ascending: false
    });

  if (componentError) {
    console.error(
      'System Component list lookup failed',
      { error: componentError }
    );

    throw new Error(
      'Unable to load System Components.'
    );
  }

  const componentIds =
    (components ?? []).map(
      (component) => component.id
    );

  const evidenceCounts =
    new Map<string, number>();

  if (componentIds.length > 0) {
    const {
      data: evidenceRows,
      error: evidenceError
    } = await supabase
      .from('component_evidence')
      .select('component_id')
      .in(
        'component_id',
        componentIds
      );

    if (evidenceError) {
      console.error(
        'System Component evidence count lookup failed',
        { error: evidenceError }
      );

      throw new Error(
        'Unable to load evidence counts.'
      );
    }

    for (const row of evidenceRows ?? []) {
      evidenceCounts.set(
        row.component_id,
        (
          evidenceCounts.get(
            row.component_id
          ) ?? 0
        ) + 1
      );
    }
  }

  const {
    data: tags
  } = await supabase
    .from('tags')
    .select('id,name')
    .order('name');

  const componentTagMap =
    new Map<string, string[]>();

  const {
    data: componentTags
  } = await supabase
    .from('component_tags')
    .select(
      'component_id,tag_id'
    );

  for (const row of componentTags ?? []) {
    const current =
      componentTagMap.get(
        row.component_id
      ) ?? [];

    current.push(row.tag_id);

    componentTagMap.set(
      row.component_id,
      current
    );
  }

  let filtered = [
    ...(components ?? [])
  ];

  if (q) {
    filtered = filtered.filter(
      (component) =>
        component.title
          ?.toLowerCase()
          .includes(q)
    );
  }

  if (typeFilter) {
    filtered = filtered.filter(
      (component) =>
        component.type ===
        typeFilter
    );
  }

  if (statusFilter) {
    filtered = filtered.filter(
      (component) =>
        component.status ===
        statusFilter
    );
  }

  if (confidenceFilter) {
    filtered = filtered.filter(
      (component) =>
        component.confidence ===
        confidenceFilter
    );
  }

  if (tagFilter) {
    filtered = filtered.filter(
      (component) =>
        (
          componentTagMap.get(
            component.id
          ) ?? []
        ).includes(tagFilter)
    );
  }

  if (sort === 'evidence') {
    filtered.sort(
      (a, b) =>
        (evidenceCounts.get(
          b.id
        ) ?? 0) -
        (evidenceCounts.get(
          a.id
        ) ?? 0)
    );
  }

  const grouped =
    new Map<
      string,
      typeof filtered
    >();

  for (const component of filtered) {
    const items =
      grouped.get(component.type) ??
      [];

    items.push(component);

    grouped.set(
      component.type,
      items
    );
  }

  return (
    <main>
      <p>PERSONAL OS · SYSTEM</p>

      <h1>Your system</h1>

      <p>
        Review the components your
        observations are building
        over time.
      </p>

      <form method="GET">
        <p>
          <label>
            Search
            <br />
            <input
              type="text"
              name="q"
              defaultValue={q}
            />
          </label>
        </p>

        <p>
          <label>
            Type
            <br />
            <select
              name="type"
              defaultValue={
                typeFilter
              }
            >
              <option value="">
                All
              </option>

              {Object.entries(
                typeLabels
              ).map(
                ([key, label]) => (
                  <option
                    key={key}
                    value={key}
                  >
                    {label}
                  </option>
                )
              )}
            </select>
          </label>
        </p>

        <p>
          <label>
            Status
            <br />
            <select
              name="status"
              defaultValue={
                statusFilter
              }
            >
              <option value="">
                All
              </option>

              <option value="observed">
                observed
              </option>

              <option value="candidate">
                candidate
              </option>

              <option value="testing">
                testing
              </option>

              <option value="confirmed">
                confirmed
              </option>

              <option value="adopted">
                adopted
              </option>

              <option value="deprecated">
                deprecated
              </option>

              <option value="retired">
                retired
              </option>
            </select>
          </label>
        </p>

        <p>
          <label>
            Confidence
            <br />
            <select
              name="confidence"
              defaultValue={
                confidenceFilter
              }
            >
              <option value="">
                All
              </option>

              <option value="low">
                low
              </option>

              <option value="medium">
                medium
              </option>

              <option value="high">
                high
              </option>
            </select>
          </label>
        </p>

        <p>
          <label>
            Tag
            <br />
            <select
              name="tag"
              defaultValue={tagFilter}
            >
              <option value="">
                All
              </option>

              {(tags ?? []).map(
                (tag) => (
                  <option
                    key={tag.id}
                    value={tag.id}
                  >
                    {tag.name}
                  </option>
                )
              )}
            </select>
          </label>
        </p>

        <p>
          <label>
            Sort
            <br />
            <select
              name="sort"
              defaultValue={sort}
            >
              <option value="created">
                Created Date
              </option>

              <option value="evidence">
                Evidence Count
              </option>
            </select>
          </label>
        </p>

        <button type="submit">
          Apply Filters
        </button>
      </form>

      {filtered.length === 0 ? (
        <p>
          No System Components yet.
          Start with the Debugger.
        </p>
      ) : null}

      {Array.from(
        grouped.entries()
      ).map(([type, items]) => (
        <section key={type}>
          <h2>
            {typeLabels[type] ?? type} ({items.length})
          </h2>

          {items.map((component) => (
            <article
              key={component.id}
              style={{ marginBottom: 20 }}
            >
              <h3 style={{ marginBottom: 4 }}>
                <Link href={`/system/components/${component.id}`}>
                  {component.title}
                </Link>
              </h3>

              <p style={{ marginTop: 0 }}>
                {typeLabels[
                  component.type
                ]?.replace(/s$/, '') ??
                  component.type}
                {' · '}
                {component.confidence ??
                  'not set'} confidence
                {' · '}
                {evidenceCounts.get(
                  component.id
                ) ?? 0}{' '}
                evidence
                {' · '}
                {component.status}

                <br />
                <br />

                Tags:{' '}
                {(tags ?? [])
                  .filter((tag) =>
                    (
                      componentTagMap.get(
                        component.id
                      ) ?? []
                    ).includes(tag.id)
                  )
                  .map((tag) => tag.name)
                  .join(', ') || 'None'}
              </p>
            </article>
          ))}
        </section>
      ))}
    </main>
  );
}
