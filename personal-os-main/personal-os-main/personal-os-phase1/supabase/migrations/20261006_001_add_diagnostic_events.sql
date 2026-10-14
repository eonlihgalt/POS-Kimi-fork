create table if not exists public.diagnostic_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  code text not null,
  area text not null,
  route text,
  severity text not null check (severity in ('warning','error')),
  message text not null,
  created_at timestamptz not null default now()
);

alter table public.diagnostic_events enable row level security;

create policy "Users can read own diagnostic events"
on public.diagnostic_events for select
to authenticated
using (auth.uid() = user_id);

create policy "Users can insert own diagnostic events"
on public.diagnostic_events for insert
to authenticated
with check (auth.uid() = user_id);

-- REQUIRED PERMISSIONS
grant select, insert
on table public.diagnostic_events
to authenticated;

create index if not exists diagnostic_events_user_created_idx
on public.diagnostic_events (user_id, created_at desc);
