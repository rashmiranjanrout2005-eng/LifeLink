create or replace function public.is_bbms_admin()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select coalesce(auth.jwt() -> 'app_metadata' ->> 'role' = 'admin', false);
$$;

create or replace function public.create_profile_for_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  selected_role text;
begin
  selected_role := coalesce(new.raw_user_meta_data ->> 'role', 'donor');
  if selected_role not in ('donor', 'hospital', 'patient') then
    selected_role := 'donor';
  end if;

  insert into public.profiles (auth_user_id, full_name, email, role, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)),
    new.email,
    selected_role,
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (auth_user_id) do update
    set email = excluded.email,
        full_name = coalesce(nullif(public.profiles.full_name, ''), excluded.full_name);

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.create_profile_for_auth_user();

create or replace function public.prevent_profile_role_escalation()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if new.role is distinct from old.role
    and coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') <> 'admin'
    and coalesce(auth.role(), '') <> 'service_role'
    and session_user not in ('postgres', 'supabase_admin') then
    raise exception 'Profile role can only be changed by an administrator';
  end if;
  return new;
end;
$$;

drop trigger if exists protect_profile_role on public.profiles;
create trigger protect_profile_role
  before update on public.profiles
  for each row execute procedure public.prevent_profile_role_escalation();

create unique index if not exists idx_donors_profile_id_unique on public.donors(profile_id);
create unique index if not exists idx_hospitals_profile_id_unique on public.hospitals(profile_id);

drop policy if exists profiles_select_own on public.profiles;
drop policy if exists profiles_update_own on public.profiles;
drop policy if exists profiles_insert_own on public.profiles;
create policy profiles_select_own_or_admin on public.profiles
  for select using (auth.uid() = auth_user_id or public.is_bbms_admin());
create policy profiles_update_own_or_admin on public.profiles
  for update using (auth.uid() = auth_user_id or public.is_bbms_admin())
  with check (auth.uid() = auth_user_id or public.is_bbms_admin());
create policy profiles_insert_own on public.profiles
  for insert with check (auth.uid() = auth_user_id);

drop policy if exists donors_select_own on public.donors;
create policy donors_select_own_or_admin on public.donors
  for select using (
    public.is_bbms_admin() or exists (
      select 1 from public.profiles p where p.id = donors.profile_id and p.auth_user_id = auth.uid()
    )
  );
create policy donors_insert_own on public.donors
  for insert with check (
    exists (select 1 from public.profiles p where p.id = donors.profile_id and p.auth_user_id = auth.uid())
  );
create policy donors_update_own_or_admin on public.donors
  for update using (
    public.is_bbms_admin() or exists (
      select 1 from public.profiles p where p.id = donors.profile_id and p.auth_user_id = auth.uid()
    )
  )
  with check (
    public.is_bbms_admin() or exists (
      select 1 from public.profiles p where p.id = donors.profile_id and p.auth_user_id = auth.uid()
    )
  );
create policy donors_delete_admin on public.donors
  for delete using (public.is_bbms_admin());

create or replace view public.available_donor_directory as
  select id, blood_group, city, district, availability_status
  from public.donors
  where consent_status = true and availability_status = 'available';
revoke all on public.available_donor_directory from public;
grant select on public.available_donor_directory to anon, authenticated;
revoke select on public.donors from anon, authenticated;

drop policy if exists hospitals_select_own on public.hospitals;
create policy hospitals_select_verified_or_own on public.hospitals
  for select using (
    is_verified or public.is_bbms_admin() or exists (
      select 1 from public.profiles p where p.id = hospitals.profile_id and p.auth_user_id = auth.uid()
    )
  );
create policy hospitals_insert_own on public.hospitals
  for insert with check (
    exists (select 1 from public.profiles p where p.id = hospitals.profile_id and p.auth_user_id = auth.uid() and p.role = 'hospital')
  );
create policy hospitals_update_own_or_admin on public.hospitals
  for update using (
    public.is_bbms_admin() or exists (
      select 1 from public.profiles p where p.id = hospitals.profile_id and p.auth_user_id = auth.uid()
    )
  )
  with check (
    public.is_bbms_admin() or exists (
      select 1 from public.profiles p where p.id = hospitals.profile_id and p.auth_user_id = auth.uid()
    )
  );

drop policy if exists blood_units_select_verified on public.blood_units;
create policy blood_units_select_approved on public.blood_units
  for select using (
    screening_status = 'approved'
    and unit_status = 'available'
    and (expiry_date is null or expiry_date >= current_date)
  );
create policy blood_units_manage_admin on public.blood_units
  for all using (public.is_bbms_admin())
  with check (public.is_bbms_admin());

alter table public.inventory_transactions enable row level security;
create policy inventory_transactions_admin_only on public.inventory_transactions
  for all using (public.is_bbms_admin())
  with check (public.is_bbms_admin());

drop policy if exists requests_select_own on public.blood_requests;
create policy blood_requests_select_own_or_admin on public.blood_requests
  for select using (
    public.is_bbms_admin()
    or exists (
      select 1 from public.profiles p where p.id = blood_requests.requester_id and p.auth_user_id = auth.uid()
    )
  );
create policy blood_requests_insert_own on public.blood_requests
  for insert with check (
    exists (
      select 1 from public.profiles p where p.id = blood_requests.requester_id and p.auth_user_id = auth.uid()
    )
  );
create policy blood_requests_update_own_or_admin on public.blood_requests
  for update using (
    public.is_bbms_admin()
    or exists (
      select 1 from public.profiles p where p.id = blood_requests.requester_id and p.auth_user_id = auth.uid()
    )
  )
  with check (public.is_bbms_admin());

alter table public.request_history enable row level security;
create policy request_history_select_owner_or_admin on public.request_history
  for select using (
    public.is_bbms_admin()
    or exists (
      select 1 from public.blood_requests r
      join public.profiles p on p.id = r.requester_id
      where r.id = request_history.request_id and p.auth_user_id = auth.uid()
    )
  );
create policy request_history_insert_admin on public.request_history
  for insert with check (public.is_bbms_admin());

drop policy if exists notifications_select_own on public.notifications;
create policy notifications_select_own on public.notifications
  for select using (
    recipient_id = (select p.id from public.profiles p where p.auth_user_id = auth.uid())
    or public.is_bbms_admin()
  );
create policy notifications_update_own on public.notifications
  for update using (
    recipient_id = (select p.id from public.profiles p where p.auth_user_id = auth.uid())
    or public.is_bbms_admin()
  )
  with check (
    recipient_id = (select p.id from public.profiles p where p.auth_user_id = auth.uid())
    or public.is_bbms_admin()
  );

create policy donations_select_owner_or_admin on public.donations
  for select using (
    public.is_bbms_admin()
    or exists (
      select 1 from public.donors d
      join public.profiles p on p.id = d.profile_id
      where d.id = donations.donor_id and p.auth_user_id = auth.uid()
    )
  );
create policy donations_insert_owner_or_admin on public.donations
  for insert with check (
    public.is_bbms_admin()
    or exists (
      select 1 from public.donors d
      join public.profiles p on p.id = d.profile_id
      where d.id = donations.donor_id and p.auth_user_id = auth.uid()
    )
  );
create policy donations_update_admin on public.donations
  for update using (public.is_bbms_admin())
  with check (public.is_bbms_admin());
