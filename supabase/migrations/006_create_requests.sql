create table if not exists blood_requests (
  id uuid primary key default uuid_generate_v4(),
  requester_id uuid references profiles(id),
  hospital_id uuid references hospitals(id),
  patient_name text not null,
  blood_group text not null,
  blood_component text not null,
  units_required int not null check (units_required > 0),
  required_date date,
  hospital_address text,
  contact_information text,
  emergency_level text default 'normal' check (emergency_level in ('normal','urgent','emergency')),
  reason text,
  request_status text default 'pending' check (request_status in ('pending','under_review','approved','rejected','reserved','fulfilled','cancelled')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists request_history (
  id uuid primary key default uuid_generate_v4(),
  request_id uuid references blood_requests(id) on delete cascade,
  previous_status text,
  new_status text not null,
  updated_by uuid references profiles(id),
  note text,
  created_at timestamptz default now()
);
