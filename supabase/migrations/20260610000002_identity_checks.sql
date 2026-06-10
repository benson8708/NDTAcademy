-- Append-only audit trail of every identity verification event. The
-- identity_verifications row remains the "current status" snapshot; this
-- table is the history that ties each exam session to a specific check.
create table public.identity_checks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  inquiry_id text not null,
  status text not null,
  verified boolean not null default false,
  created_at timestamptz not null default now()
);
create index identity_checks_user_idx on public.identity_checks(user_id, created_at desc);

alter table public.identity_checks enable row level security;
create policy "identity_checks_select" on public.identity_checks
  for select using (user_id = auth.uid() or public.manages_user(user_id));
-- service-role writes only
