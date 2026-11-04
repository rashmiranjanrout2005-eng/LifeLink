create extension if not exists "uuid-ossp";

create table if not exists profiles (
  id uuid primary key default uuid_generate_v4(),
  auth_user_id uuid unique,
  full_name text not null,
  email text unique not null,
  phone text,
  role text not null default 'donor' check (role in ('admin','donor','hospital','patient')),
  avatar_url text,
  is_verified boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_profiles_email on profiles(email);
create index if not exists idx_profiles_role on profiles(role);
