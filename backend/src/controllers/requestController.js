import { isSupabaseConfigured, supabaseAdmin } from '../config/supabase.js';

const requireDatabase = (res) => {
  if (isSupabaseConfigured) return true;
  res.status(503).json({ success: false, message: 'Blood requests require a configured Supabase database.' });
  return false;
};

const getProfile = async (userId) => supabaseAdmin
  .from('profiles')
  .select('id, role')
  .eq('auth_user_id', userId)
  .maybeSingle();

export const getRequests = async (req, res) => {
  if (!requireDatabase(res)) return;
  const { data: profile, error: profileError } = await getProfile(req.user.id);
  if (profileError) return res.status(500).json({ success: false, message: profileError.message });
  if (!profile) return res.status(403).json({ success: false, message: 'A profile is required.' });

  let query = supabaseAdmin.from('blood_requests').select('*').order('created_at', { ascending: false });
  if (profile.role !== 'admin') query = query.eq('requester_id', profile.id);
  const { data, error } = await query.limit(100);
  if (error) return res.status(500).json({ success: false, message: error.message });
  return res.status(200).json({ success: true, data });
};

export const createRequest = async (req, res) => {
  if (!requireDatabase(res)) return;
  const { data: profile, error: profileError } = await getProfile(req.user.id);
  if (profileError) return res.status(500).json({ success: false, message: profileError.message });
  if (!profile) return res.status(403).json({ success: false, message: 'A profile is required.' });

  const { patient_name, blood_group, blood_component, units_required, required_date, hospital_address, contact_information, emergency_level, reason, hospital_id } = req.body;
  if (!patient_name || !blood_group || !blood_component || !Number.isInteger(Number(units_required)) || Number(units_required) < 1) {
    return res.status(400).json({ success: false, message: 'patient_name, blood_group, blood_component, and a positive units_required value are required.' });
  }
  if (!['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].includes(blood_group)) {
    return res.status(400).json({ success: false, message: 'A valid blood group is required.' });
  }

  const { data, error } = await supabaseAdmin.from('blood_requests').insert({
    requester_id: profile.id,
    hospital_id: hospital_id || null,
    patient_name: String(patient_name).trim(),
    blood_group,
    blood_component,
    units_required: Number(units_required),
    required_date: required_date || null,
    hospital_address: hospital_address || null,
    contact_information: contact_information || null,
    emergency_level: ['normal', 'urgent', 'emergency'].includes(emergency_level) ? emergency_level : 'normal',
    reason: reason || null
  }).select().single();

  if (error) return res.status(400).json({ success: false, message: error.message });
  return res.status(201).json({ success: true, data });
};

export const getRequestById = async (req, res) => {
  if (!requireDatabase(res)) return;
  const { data: profile, error: profileError } = await getProfile(req.user.id);
  if (profileError) return res.status(500).json({ success: false, message: profileError.message });
  if (!profile) return res.status(403).json({ success: false, message: 'A profile is required.' });
  let query = supabaseAdmin.from('blood_requests').select('*').eq('id', req.params.id);
  if (profile.role !== 'admin') query = query.eq('requester_id', profile.id);
  const { data, error } = await query.maybeSingle();
  if (error) return res.status(500).json({ success: false, message: error.message });
  if (!data) return res.status(404).json({ success: false, message: 'Request not found.' });
  return res.status(200).json({ success: true, data });
};

export const updateRequestStatus = async (req, res) => {
  if (!requireDatabase(res)) return;
  const allowedStatuses = ['under_review', 'approved', 'rejected', 'reserved', 'fulfilled', 'cancelled'];
  if (!allowedStatuses.includes(req.body.status)) {
    return res.status(400).json({ success: false, message: 'A valid request status is required.' });
  }

  const { data, error } = await supabaseAdmin.rpc('update_blood_request_status', {
    p_request_id: req.params.id,
    p_status: req.body.status,
    p_updated_by: req.profile?.id || null,
    p_note: req.body.note || null
  });
  if (error) return res.status(400).json({ success: false, message: error.message });
  if (!data) return res.status(404).json({ success: false, message: 'Request not found.' });
  return res.status(200).json({ success: true, data });
};
