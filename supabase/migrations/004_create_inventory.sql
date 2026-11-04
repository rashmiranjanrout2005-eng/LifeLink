create table if not exists blood_units (
  id uuid primary key default uuid_generate_v4(),
  unit_id text unique not null,
  blood_group text not null,
  component text not null,
  donation_id uuid,
  collection_date date,
  expiry_date date,
  screening_status text default 'pending' check (screening_status in ('pending','approved','rejected')),
  storage_status text default 'stored' check (storage_status in ('stored','reserved','issued','discarded')),
  unit_status text default 'available' check (unit_status in ('available','reserved','issued','expired','discarded')),
  blood_bank_id uuid,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists inventory_transactions (
  id uuid primary key default uuid_generate_v4(),
  blood_unit_id uuid references blood_units(id),
  transaction_type text not null check (transaction_type in ('add','reserve','issue','discard','update')),
  quantity int not null default 1,
  performed_by uuid references profiles(id),
  created_at timestamptz default now()
);
