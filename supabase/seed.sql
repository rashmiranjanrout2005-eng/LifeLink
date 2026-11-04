insert into profiles (auth_user_id, full_name, email, phone, role, is_verified)
values
  (gen_random_uuid(), 'Admin User', 'admin@bbms.local', '9090909090', 'admin', true),
  (gen_random_uuid(), 'Riya Donor', 'riya@bbms.local', '9876543210', 'donor', true),
  (gen_random_uuid(), 'City Hospital', 'hospital@bbms.local', '9988776655', 'hospital', true)
on conflict do nothing;

insert into donors (profile_id, blood_group, city, district, pincode, availability_status, last_donation_date, consent_status)
values
  ((select id from profiles where email='riya@bbms.local'), 'O+', 'Bhubaneswar', 'Khorda', '751001', 'available', '2024-10-10', true);
