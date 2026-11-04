alter table profiles enable row level security;
alter table donors enable row level security;
alter table hospitals enable row level security;
alter table blood_units enable row level security;
alter table donations enable row level security;
alter table blood_requests enable row level security;
alter table notifications enable row level security;

create policy "profiles_select_own" on profiles for select using (auth.uid() = auth_user_id);
create policy "profiles_update_own" on profiles for update using (auth.uid() = auth_user_id);
create policy "profiles_insert_own" on profiles for insert with check (auth.uid() = auth_user_id);

create policy "donors_select_own" on donors for select using (true);
create policy "hospitals_select_own" on hospitals for select using (true);
create policy "blood_units_select_verified" on blood_units for select using (screening_status = 'approved');
create policy "requests_select_own" on blood_requests for select using (requester_id = auth.uid() or true);
create policy "notifications_select_own" on notifications for select using (recipient_id = auth.uid());
