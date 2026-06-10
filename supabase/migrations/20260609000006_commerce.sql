-- NDT Academy — Phase 3 commerce (Stripe)
-- Purchases, course entitlements, org seat ledger, Stripe customer map,
-- processed-webhook ledger. All writes happen server-side with the service
-- role (webhook + checkout success fulfillment); clients get read-only,
-- RLS-scoped views of their own billing state.

-- ============================================================
-- STRIPE CUSTOMER MAP (one Stripe customer per auth user)
-- ============================================================
create table public.stripe_customers (
  user_id uuid primary key references auth.users(id) on delete cascade,
  stripe_customer_id text not null unique,
  created_at timestamptz not null default now()
);

-- ============================================================
-- PURCHASES (one row per paid Checkout Session)
-- ============================================================
create table public.purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  org_id uuid references public.organizations(id) on delete set null,
  kind text not null check (kind in ('course','seat_pack')),
  course_id text references public.courses(id),
  seats integer check (seats is null or seats > 0),
  stripe_checkout_session_id text not null unique,
  stripe_payment_intent_id text unique,
  amount_total integer not null default 0,          -- cents
  currency text not null default 'usd',
  status text not null default 'paid' check (status in ('paid','refunded')),
  created_at timestamptz not null default now(),
  check (kind <> 'course' or course_id is not null),
  check (kind <> 'seat_pack' or (org_id is not null and seats is not null))
);
create index purchases_user_idx on public.purchases(user_id, created_at desc);
create index purchases_org_idx on public.purchases(org_id) where org_id is not null;

-- ============================================================
-- COURSE ENTITLEMENTS (what the paywall checks)
-- A row with revoked_at null grants the user that course.
-- Org-seat access is NOT materialized here — membership in an org
-- grants catalog access directly (seat_limit caps roster size).
-- ============================================================
create table public.course_entitlements (
  user_id uuid not null references auth.users(id) on delete cascade,
  course_id text not null references public.courses(id),
  source text not null default 'purchase' check (source in ('purchase','admin','beta')),
  purchase_id uuid references public.purchases(id) on delete set null,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  primary key (user_id, course_id)
);

-- ============================================================
-- ORG SEAT LEDGER (audit trail for seat_limit changes)
-- ============================================================
create table public.seat_events (
  id bigint generated always as identity primary key,
  org_id uuid not null references public.organizations(id) on delete cascade,
  delta integer not null,
  reason text not null check (reason in ('purchase','refund','admin')),
  purchase_id uuid references public.purchases(id) on delete set null,
  created_at timestamptz not null default now()
);
create index seat_events_org_idx on public.seat_events(org_id, created_at desc);

-- Atomic seat_limit adjustment. Floor: never below current roster size or 1
-- (a refund cannot auto-evict technicians). Service-role only.
create or replace function public.apply_seat_delta(p_org uuid, p_delta integer)
returns integer language plpgsql security definer set search_path = public as $$
declare v_members integer; v_new integer;
begin
  select count(*) into v_members from org_memberships where org_id = p_org;
  update organizations
     set seat_limit = greatest(seat_limit + p_delta, greatest(v_members, 1))
   where id = p_org
   returning seat_limit into v_new;
  return v_new;
end;
$$;
revoke execute on function public.apply_seat_delta(uuid, integer) from public, anon, authenticated;

-- ============================================================
-- PROCESSED WEBHOOK EVENTS (replay short-circuit + audit)
-- ============================================================
create table public.stripe_events (
  id text primary key,               -- evt_...
  type text not null,
  processed_at timestamptz not null default now()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table public.stripe_customers enable row level security;
alter table public.purchases enable row level security;
alter table public.course_entitlements enable row level security;
alter table public.seat_events enable row level security;
alter table public.stripe_events enable row level security;

-- Reads: own rows; org admins see their org's purchases/seat history and
-- their technicians' entitlements. No client write policies on any of these —
-- the webhook / fulfillment code writes with the service role.
create policy "stripe_customers_select_own" on public.stripe_customers
  for select using (user_id = auth.uid());

create policy "purchases_select" on public.purchases
  for select using (
    user_id = auth.uid()
    or (org_id is not null and public.is_org_admin(org_id))
  );

create policy "entitlements_select" on public.course_entitlements
  for select using (user_id = auth.uid() or public.manages_user(user_id));

create policy "seat_events_select_admin" on public.seat_events
  for select using (public.is_org_admin(org_id));

-- stripe_events: no policies — service role only.
