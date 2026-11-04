create table if not exists notifications (
  id uuid primary key default uuid_generate_v4(),
  recipient_id uuid references profiles(id),
  title text not null,
  message text not null,
  is_read boolean default false,
  created_at timestamptz default now()
);
