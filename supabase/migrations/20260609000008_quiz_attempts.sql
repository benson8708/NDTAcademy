-- Assessment attempts for in-course knowledge checks, module quizzes, and
-- level final exams. scope_id is the lesson/module/level id from the catalog.
create table public.quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  scope text not null check (scope in ('check','module','final')),
  scope_id text not null,
  total integer not null,
  correct integer not null,
  score numeric not null,
  passed boolean not null,
  detail jsonb,
  created_at timestamptz not null default now()
);
create index quiz_attempts_user_scope_idx
  on public.quiz_attempts(user_id, scope, scope_id, created_at desc);

alter table public.quiz_attempts enable row level security;
create policy "quiz_attempts_select" on public.quiz_attempts
  for select using (user_id = auth.uid() or public.manages_user(user_id));
create policy "quiz_attempts_insert_own" on public.quiz_attempts
  for insert with check (user_id = auth.uid());
