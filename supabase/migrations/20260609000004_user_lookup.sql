-- Service-role-only helper: resolve an auth user id from an email for org
-- roster management. Revoked from anon/authenticated so clients cannot probe
-- which emails have accounts.
create or replace function public.get_user_id_by_email(p_email text)
returns uuid language sql stable security definer set search_path = public as $$
  select id from auth.users where lower(email) = lower(p_email) limit 1;
$$;
revoke execute on function public.get_user_id_by_email(text) from public, anon, authenticated;
