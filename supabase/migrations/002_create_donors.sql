create table if not exists donors (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid references profiles(id) on delete cascade,
  blood_group text not null,
  city text,
  district text,
  pincode text,
  availability_status text default 'available' check (availability_status in ('available','unavailable','paused')),
  last_donation_date date,
  consent_status boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_donors_blood_group on donors(blood_group);
create index if not exists idx_donors_availability on donors(availability_status);
