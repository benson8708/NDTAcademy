-- NDT Academy — schema v1
-- Catalog (courses → levels → modules → lessons), question bank,
-- learner state (enrollments, progress, time ledger, exam attempts, certificates),
-- organizations with seat-based membership. RLS on every exposed table.

-- ============================================================
-- PROFILES
-- ============================================================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  role text not null default 'student' check (role in ('student','company_admin','platform_admin')),
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', ''));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- ORGANIZATIONS
-- ============================================================
create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  seat_limit integer not null default 5 check (seat_limit > 0),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.org_memberships (
  org_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member' check (role in ('member','admin')),
  created_at timestamptz not null default now(),
  primary key (org_id, user_id)
);

-- Security-definer helpers (avoid recursive RLS lookups)
create or replace function public.is_org_member(p_org uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from org_memberships
    where org_id = p_org and user_id = auth.uid()
  );
$$;

create or replace function public.is_org_admin(p_org uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from org_memberships
    where org_id = p_org and user_id = auth.uid() and role = 'admin'
  );
$$;

-- Is the caller an admin of any org that p_user belongs to?
create or replace function public.manages_user(p_user uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1
    from org_memberships a
    join org_memberships m on m.org_id = a.org_id
    where a.user_id = auth.uid() and a.role = 'admin' and m.user_id = p_user
  );
$$;

-- Atomic org creation: org + creator as admin member
create or replace function public.create_organization(p_name text, p_seats integer default 5)
returns uuid language plpgsql security definer set search_path = public as $$
declare v_org uuid;
begin
  if auth.uid() is null then raise exception 'not authenticated'; end if;
  insert into organizations (name, seat_limit, created_by)
  values (p_name, greatest(p_seats, 1), auth.uid())
  returning id into v_org;
  insert into org_memberships (org_id, user_id, role) values (v_org, auth.uid(), 'admin');
  update profiles set role = 'company_admin' where id = auth.uid() and role = 'student';
  return v_org;
end;
$$;

-- ============================================================
-- CATALOG
-- ============================================================
create table public.courses (
  id text primary key,
  code text not null,
  name text not null,
  cp105 text,
  hours jsonb not null default '{}'::jsonb,
  exam_method text,              -- question-bank key (UT/RT/MPI/LPI/ECT), null if none
  summary text,
  jurisdiction_note text,
  sort integer not null default 0
);

create table public.course_levels (
  id text primary key,
  course_id text not null references public.courses(id) on delete cascade,
  level text not null,
  target_hours numeric not null default 0,
  description text,
  final_exam jsonb,
  sort integer not null default 0
);

create table public.modules (
  id text primary key,
  level_id text not null references public.course_levels(id) on delete cascade,
  title text not null,
  cp_section text,
  hours numeric not null default 0,
  module_quiz jsonb,
  sort integer not null default 0
);

create table public.lessons (
  id text primary key,
  module_id text not null references public.modules(id) on delete cascade,
  title text not null,
  minutes integer not null default 0,
  objectives jsonb not null default '[]'::jsonb,
  topics jsonb not null default '[]'::jsonb,
  media jsonb not null default '[]'::jsonb,
  knowledge_check jsonb,
  sort integer not null default 0
);
create index lessons_module_idx on public.lessons(module_id, sort);

-- ============================================================
-- QUESTION BANK (5,011 questions; flagged for generic rewrite per plan)
-- ============================================================
create table public.questions (
  id bigint generated always as identity primary key,
  method text not null,
  level integer not null check (level between 1 and 3),
  question text not null,
  options jsonb not null,
  correct integer not null check (correct between 0 and 3),
  generic_rewrite_pending boolean not null default true
);
create index questions_method_level_idx on public.questions(method, level);

-- Random draw for the practice-exam engine (works for anon + authed)
create or replace function public.draw_questions(p_method text, p_level integer, p_count integer)
returns setof public.questions
language sql stable security definer set search_path = public as $$
  select * from questions
  where method = p_method and level = p_level
  order by random()
  limit least(greatest(p_count, 1), 100);
$$;

-- ============================================================
-- LEARNER STATE
-- ============================================================
create table public.enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  course_id text not null references public.courses(id),
  status text not null default 'active' check (status in ('active','completed','cancelled')),
  enrolled_at timestamptz not null default now(),
  unique (user_id, course_id)
);

create table public.lesson_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  lesson_id text not null references public.lessons(id) on delete cascade,
  completed_at timestamptz not null default now(),
  primary key (user_id, lesson_id)
);

-- Heartbeat-fed active-engagement ledger. Each row is one short slice of
-- verified engaged time; 120 s cap defends against forged long slices.
create table public.time_logs (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  course_id text not null references public.courses(id),
  lesson_id text references public.lessons(id) on delete set null,
  seconds integer not null check (seconds > 0 and seconds <= 120),
  created_at timestamptz not null default now()
);
create index time_logs_user_course_idx on public.time_logs(user_id, course_id);

create table public.exam_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  method text not null,
  level integer not null,
  total integer not null,
  correct integer not null,
  score numeric not null,
  passed boolean not null,
  duration_seconds integer,
  detail jsonb,
  created_at timestamptz not null default now()
);
create index exam_attempts_user_idx on public.exam_attempts(user_id, created_at desc);

-- Issued server-side only (no client insert policy). Immutable once issued.
create table public.certificates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  course_id text not null references public.courses(id),
  level_id text references public.course_levels(id),
  title text not null,
  hours numeric not null,
  verification_code text not null unique default encode(gen_random_bytes(8), 'hex'),
  issued_at timestamptz not null default now()
);

-- Hours rollup that respects the querying user's RLS
create view public.training_hours_v
with (security_invoker = true) as
  select user_id, course_id, round(sum(seconds)::numeric / 3600, 2) as hours
  from public.time_logs
  group by user_id, course_id;

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table public.profiles enable row level security;
alter table public.organizations enable row level security;
alter table public.org_memberships enable row level security;
alter table public.courses enable row level security;
alter table public.course_levels enable row level security;
alter table public.modules enable row level security;
alter table public.lessons enable row level security;
alter table public.questions enable row level security;
alter table public.enrollments enable row level security;
alter table public.lesson_progress enable row level security;
alter table public.time_logs enable row level security;
alter table public.exam_attempts enable row level security;
alter table public.certificates enable row level security;

-- Catalog + question bank: public read (free practice exams are a funnel;
-- the full bank already ships in the public prototype)
create policy "catalog_read" on public.courses for select using (true);
create policy "catalog_read" on public.course_levels for select using (true);
create policy "catalog_read" on public.modules for select using (true);
create policy "catalog_read" on public.lessons for select using (true);
create policy "questions_read" on public.questions for select using (true);

-- Profiles
create policy "profiles_select_own" on public.profiles
  for select using (id = auth.uid() or public.manages_user(id));
create policy "profiles_update_own" on public.profiles
  for update using (id = auth.uid()) with check (id = auth.uid());

-- Organizations
create policy "orgs_select_member" on public.organizations
  for select using (public.is_org_member(id));
create policy "orgs_update_admin" on public.organizations
  for update using (public.is_org_admin(id)) with check (public.is_org_admin(id));

-- Memberships
create policy "memberships_select" on public.org_memberships
  for select using (user_id = auth.uid() or public.is_org_admin(org_id));
create policy "memberships_insert_admin" on public.org_memberships
  for insert with check (public.is_org_admin(org_id));
create policy "memberships_delete_admin" on public.org_memberships
  for delete using (public.is_org_admin(org_id) or user_id = auth.uid());

-- Enrollments
create policy "enrollments_select" on public.enrollments
  for select using (user_id = auth.uid() or public.manages_user(user_id));
create policy "enrollments_insert_own" on public.enrollments
  for insert with check (user_id = auth.uid());
create policy "enrollments_update_own" on public.enrollments
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Lesson progress
create policy "progress_select" on public.lesson_progress
  for select using (user_id = auth.uid() or public.manages_user(user_id));
create policy "progress_insert_own" on public.lesson_progress
  for insert with check (user_id = auth.uid());
create policy "progress_delete_own" on public.lesson_progress
  for delete using (user_id = auth.uid());

-- Time logs (inserted via authenticated heartbeat; users cannot edit/delete)
create policy "time_select" on public.time_logs
  for select using (user_id = auth.uid() or public.manages_user(user_id));
create policy "time_insert_own" on public.time_logs
  for insert with check (user_id = auth.uid());

-- Exam attempts
create policy "attempts_select" on public.exam_attempts
  for select using (user_id = auth.uid() or public.manages_user(user_id));
create policy "attempts_insert_own" on public.exam_attempts
  for insert with check (user_id = auth.uid());

-- Certificates (read-only from clients)
create policy "certs_select" on public.certificates
  for select using (user_id = auth.uid() or public.manages_user(user_id));
