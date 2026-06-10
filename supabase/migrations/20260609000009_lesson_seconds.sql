-- Per-level training-time rollup: sum of the caller's logged seconds over a
-- set of lesson ids. Security invoker — RLS restricts to own rows.
create or replace function public.lesson_seconds(p_lesson_ids text[])
returns bigint
language sql stable security invoker
as $$
  select coalesce(sum(seconds), 0)::bigint
  from public.time_logs
  where user_id = auth.uid() and lesson_id = any(p_lesson_ids);
$$;
grant execute on function public.lesson_seconds(text[]) to authenticated;
revoke execute on function public.lesson_seconds(text[]) from anon;
