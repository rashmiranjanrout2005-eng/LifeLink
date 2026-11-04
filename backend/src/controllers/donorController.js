import { isSupabaseConfigured, supabaseAdmin } from '../config/supabase.js';

const demoDonors = [
  { id: 'demo-donor-a', blood_group: 'O+', city: 'Berhampur', district: 'Ganjam', availability_status: 'available' },
  { id: 'demo-donor-b', blood_group: 'A+', city: 'Bhubaneswar', district: 'Khordha', availability_status: 'available' },
  { id: 'demo-donor-c', blood_group: 'B-', city: 'Cuttack', district: 'Cuttack', availability_status: 'available' }
];

export const getDonors = async (req, res) => {
  if (!isSupabaseConfigured) {
    if (process.env.NODE_ENV === 'production') {
      return res.status(503).json({ success: false, message: 'Donor search requires a configured database.' });
    }
    const filtered = demoDonors.filter((donor) =>
      (!req.query.bloodGroup || donor.blood_group === req.query.bloodGroup) &&
      (!req.query.city || donor.city.toLowerCase().includes(String(req.query.city).toLowerCase()))
    );
    return res.status(200).json({ success: true, demo: true, data: filtered });
  }

  let query = supabaseAdmin
    .from('donors')
    .select('id, blood_group, city, district, availability_status')
    .eq('availability_status', 'available')
    .eq('consent_status', true);
  if (req.query.bloodGroup) query = query.eq('blood_group', req.query.bloodGroup);
  if (req.query.city) query = query.ilike('city', `%${String(req.query.city).trim()}%`);
  if (req.query.district) query = query.ilike('district', `%${String(req.query.district).trim()}%`);
  if (req.query.pincode) query = query.eq('pincode', String(req.query.pincode).trim());

  const { data, error } = await query.order('created_at', { ascending: false }).limit(100);
  if (error) return res.status(500).json({ success: false, message: error.message });
  return res.status(200).json({ success: true, data });
};

export const createDonor = async (req, res) => {
  if (!isSupabaseConfigured) return res.status(503).json({ success: false, message: 'Donor registration requires a configured database.' });
  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .select('id, role')
    .eq('auth_user_id', req.user.id)
    .single();
  if (profileError) return res.status(400).json({ success: false, message: profileError.message });
  if (!['donor', 'admin'].includes(profile.role)) {
    return res.status(403).json({ success: false, message: 'Only donor accounts can create a donor profile.' });
  }

  const { blood_group, city, district, pincode, last_donation_date } = req.body;
  if (!['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].includes(blood_group)) {
    return res.status(400).json({ success: false, message: 'A valid blood_group is required.' });
  }
  const { data, error } = await supabaseAdmin.from('donors').upsert({
    profile_id: profile.id,
    blood_group,
    city,
    district,
    pincode,
    last_donation_date
  }, { onConflict: 'profile_id' }).select().single();
  if (error) return res.status(400).json({ success: false, message: error.message });
  return res.status(201).json({ success: true, data });
};

export const updateDonor = async (req, res) => {
  if (!isSupabaseConfigured) return res.status(503).json({ success: false, message: 'Donor updates require a configured database.' });
  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles').select('id, role').eq('auth_user_id', req.user.id).maybeSingle();
  if (profileError) return res.status(500).json({ success: false, message: profileError.message });
  if (!profile) return res.status(403).json({ success: false, message: 'A profile is required.' });

  const allowedFields = ['city', 'district', 'pincode', 'availability_status', 'last_donation_date', 'consent_status'];
  const updates = Object.fromEntries(Object.entries(req.body).filter(([key]) => allowedFields.includes(key)));
  let query = supabaseAdmin.from('donors').update(updates).eq('id', req.params.id);
  if (profile.role !== 'admin') query = query.eq('profile_id', profile.id);
  const { data, error } = await query.select().maybeSingle();
  if (error) return res.status(400).json({ success: false, message: error.message });
  if (!data) return res.status(404).json({ success: false, message: 'Donor record not found.' });
  return res.status(200).json({ success: true, data });
};

export const deleteDonor = async (req, res) => {
  if (!isSupabaseConfigured) return res.status(503).json({ success: false, message: 'Donor deletion requires a configured database.' });
  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles').select('id, role').eq('auth_user_id', req.user.id).maybeSingle();
  if (profileError) return res.status(500).json({ success: false, message: profileError.message });
  if (!profile || profile.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Only administrators can delete donor records.' });
  }
  const { error } = await supabaseAdmin.from('donors').delete().eq('id', req.params.id);
  if (error) return res.status(400).json({ success: false, message: error.message });
  return res.status(200).json({ success: true, message: 'Donor deleted.' });
};
