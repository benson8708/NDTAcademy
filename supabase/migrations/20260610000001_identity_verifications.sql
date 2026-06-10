-- Identity proofing (Persona): one row per user, written only by the server
-- after the inquiry is fetched from Persona's API and its reference-id is
-- matched to the user. Gates course access, exams, and certificate issuance.
create table public.identity_verifications (
  user_id uuid primary key references auth.users(id) on delete cascade,
  inquiry_id text not null,
  status text not null,
  verified boolean not null default false,
  verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.identity_verifications enable row level security;
-- Students see their own status; company admins see their roster's (audit view)
create policy "identity_select" on public.identity_verifications
  for select using (user_id = auth.uid() or public.manages_user(user_id));
-- No client insert/update policies: writes go through the service role only.
