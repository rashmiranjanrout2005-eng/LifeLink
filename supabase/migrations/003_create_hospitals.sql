create table if not exists hospitals (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid references profiles(id) on delete cascade,
  hospital_name text not null,
  license_number text,
  address text,
  city text,
  district text,
  phone text,
  is_verified boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
