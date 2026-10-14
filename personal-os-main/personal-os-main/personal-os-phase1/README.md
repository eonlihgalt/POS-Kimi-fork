# Personal Operating System

> Personal OS does not digitize introspection. It turns observations into structured, testable, version-controlled knowledge about how a person operates.

## Phase 1
Foundation scaffold: relational schema, RLS, domain types, lifecycle rules, and Zod validation.

## Setup
1. Install Node.js and Docker Desktop.
2. Copy `.env.example` to `.env.local` and add Supabase values.
3. Run `npm install`.
4. Install/use Supabase CLI, then run `npx supabase start`.
5. Apply/reset migrations with `npx supabase db reset`.
6. Run tests with `npm test`.
7. Run the app with `npm run dev` after UI routes are added.

### Implemented vertical slice
Account auth -> automatic workspace -> Debug Session -> persisted detail -> analysis -> candidate System Component -> Observation -> Evidence link.

Set `NEXT_PUBLIC_SITE_URL=http://localhost:3000` for local email confirmation redirects.

Deployment initialized.

Production environment configured.
