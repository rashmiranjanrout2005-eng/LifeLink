create table if not exists donations (
  id uuid primary key default uuid_generate_v4(),
  donor_id uuid references donors(id),
  donation_date date not null,
  units_donated numeric(4,1) default 1,
  status text not null default 'pending' check (status in ('pending','approved','rejected','completed')),
  remarks text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
