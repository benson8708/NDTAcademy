-- Seat changes must be exactly-once under webhook retries and the
-- webhook/success-page race. The ledger row is the idempotency gate and the
-- seat_limit update happens in the same transaction.

create unique index seat_events_purchase_once
  on public.seat_events(purchase_id, reason)
  where purchase_id is not null;

drop function public.apply_seat_delta(uuid, integer);

-- Insert a seat ledger row and apply the delta atomically. If this
-- (purchase, reason) was already applied, returns the current seat_limit
-- without re-applying. Floor: never below the current roster size or 1
-- (a refund cannot auto-evict technicians). Service-role only.
create function public.apply_seat_change(
  p_org uuid, p_delta integer, p_reason text, p_purchase uuid
) returns integer language plpgsql security definer set search_path = public as $$
declare v_inserted boolean; v_members integer; v_new integer;
begin
  insert into seat_events (org_id, delta, reason, purchase_id)
  values (p_org, p_delta, p_reason, p_purchase)
  on conflict (purchase_id, reason) where purchase_id is not null do nothing
  returning true into v_inserted;

  if v_inserted is null then
    select seat_limit into v_new from organizations where id = p_org;
    return v_new;  -- already applied for this purchase
  end if;

  select count(*) into v_members from org_memberships where org_id = p_org;
  update organizations
     set seat_limit = greatest(seat_limit + p_delta, greatest(v_members, 1))
   where id = p_org
   returning seat_limit into v_new;
  return v_new;
end;
$$;
revoke execute on function public.apply_seat_change(uuid, integer, text, uuid)
  from public, anon, authenticated;
