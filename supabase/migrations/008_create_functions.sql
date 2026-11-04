create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create or replace function enforce_inventory_consistency()
returns trigger as $$
begin
  if new.unit_status = 'issued' and new.storage_status != 'issued' then
    new.storage_status = 'issued';
  end if;
  return new;
end;
$$ language plpgsql;
