import { isSupabaseConfigured, supabaseAdmin } from '../config/supabase.js';

const readProfile = (userId) => supabaseAdmin
  .from('profiles').select('id, role').eq('auth_user_id', userId).maybeSingle();

export const getHospitals = async (req, res) => {
  if (!isSupabaseConfigured) return res.status(503).json({ success: false, message: 'Hospital directory requires a configured database.' });
  const { data: profile, error: profileError } = await readProfile(req.user.id);
  if (profileError) return res.status(500).json({ success: false, message: profileError.message });
  let query = supabaseAdmin.from('hospitals').select('*').order('hospital_name');
  if (profile?.role !== 'admin') {
    query = query.eq('profile_id', profile?.id || '00000000-0000-0000-0000-000000000000');
  }
  const { data, error } = await query.limit(100);
  if (error) return res.status(500).json({ success: false, message: error.message });
  return res.status(200).json({ success: true, data });
};

export const createHospital = async (req, res) => {
  if (!isSupabaseConfigured) return res.status(503).json({ success: false, message: 'Hospital registration requires a configured database.' });
  const { data: profile, error: profileError } = await readProfile(req.user.id);
  if (profileError) return res.status(500).json({ success: false, message: profileError.message });
  if (!profile || !['hospital', 'admin'].includes(profile.role)) {
    return res.status(403).json({ success: false, message: 'Register a hospital account before creating a hospital profile.' });
  }
  const { hospital_name, license_number, address, city, district, phone } = req.body;
  if (!hospital_name || !String(hospital_name).trim()) {
    return res.status(400).json({ success: false, message: 'hospital_name is required.' });
  }
  const { data, error } = await supabaseAdmin.from('hospitals').upsert({
    profile_id: profile.id,
    hospital_name: String(hospital_name).trim(),
    license_number,
    address,
    city,
    district,
    phone
  }, { onConflict: 'profile_id' }).select().single();
  if (error) return res.status(400).json({ success: false, message: error.message });
  return res.status(201).json({ success: true, data });
};

export const updateHospital = async (req, res) => {
  if (!isSupabaseConfigured) return res.status(503).json({ success: false, message: 'Hospital updates require a configured database.' });
  const { data: profile, error: profileError } = await readProfile(req.user.id);
  if (profileError) return res.status(500).json({ success: false, message: profileError.message });
  if (!profile) return res.status(403).json({ success: false, message: 'A profile is required.' });

  const fields = ['hospital_name', 'license_number', 'address', 'city', 'district', 'phone'];
  const updates = Object.fromEntries(Object.entries(req.body).filter(([key]) => fields.includes(key)));
  let query = supabaseAdmin.from('hospitals').update(updates).eq('id', req.params.id);
  if (profile.role !== 'admin') query = query.eq('profile_id', profile.id);
  const { data, error } = await query.select().maybeSingle();
  if (error) return res.status(400).json({ success: false, message: error.message });
  if (!data) return res.status(404).json({ success: false, message: 'Hospital not found.' });
  return res.status(200).json({ success: true, data });
};
