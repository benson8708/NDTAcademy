-- PostgREST resolves the org_memberships -> profiles embed through a real FK.
-- profiles rows are guaranteed by the on_auth_user_created trigger.
alter table public.org_memberships
  add constraint org_memberships_user_profile_fkey
  foreign key (user_id) references public.profiles(id) on delete cascade;
