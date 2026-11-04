create or replace function public.update_blood_request_status(
  p_request_id uuid,
  p_status text,
  p_updated_by uuid,
  p_note text default null
)
returns public.blood_requests
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  updated_request public.blood_requests;
  old_status text;
begin
  if p_status not in ('under_review', 'approved', 'rejected', 'reserved', 'fulfilled', 'cancelled') then
    raise exception 'Invalid blood request status';
  end if;

  select request_status into old_status
  from public.blood_requests
  where id = p_request_id
  for update;

  if not found then
    return null;
  end if;

  update public.blood_requests
  set request_status = p_status, updated_at = now()
  where id = p_request_id
  returning * into updated_request;

  insert into public.request_history (request_id, previous_status, new_status, updated_by, note)
  values (updated_request.id, old_status, p_status, p_updated_by, p_note);

  return updated_request;
end;
$$;

revoke all on function public.update_blood_request_status(uuid, text, uuid, text) from public, anon, authenticated;
grant execute on function public.update_blood_request_status(uuid, text, uuid, text) to service_role;
