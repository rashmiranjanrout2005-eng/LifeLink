import { isSupabaseConfigured, supabaseAdmin } from '../config/supabase.js';

const getProfile = (userId) => supabaseAdmin
  .from('profiles').select('id, role').eq('auth_user_id', userId).maybeSingle();

export const getDonations = async (req, res) => {
  if (!isSupabaseConfigured) return res.status(503).json({ success: false, message: 'Donation history requires a configured database.' });
  const { data: profile, error: profileError } = await getProfile(req.user.id);
  if (profileError) return res.status(500).json({ success: false, message: profileError.message });
  if (!profile) return res.status(403).json({ success: false, message: 'A profile is required.' });

  let query = supabaseAdmin.from('donations').select('*, donors(blood_group, profile_id)').order('donation_date', { ascending: false });
  if (profile.role !== 'admin') {
    const { data: donor, error: donorError } = await supabaseAdmin.from('donors')
      .select('id').eq('profile_id', profile.id).maybeSingle();
    if (donorError) return res.status(500).json({ success: false, message: donorError.message });
    if (!donor) return res.status(200).json({ success: true, data: [] });
    query = query.eq('donor_id', donor.id);
  }
  const { data, error } = await query.limit(100);
  if (error) return res.status(500).json({ success: false, message: error.message });
  return res.status(200).json({ success: true, data });
};

export const createDonation = async (req, res) => {
  if (!isSupabaseConfigured) return res.status(503).json({ success: false, message: 'Donation records require a configured database.' });
  const { data: profile, error: profileError } = await getProfile(req.user.id);
  if (profileError) return res.status(500).json({ success: false, message: profileError.message });
  if (!profile || !['donor', 'admin'].includes(profile.role)) {
    return res.status(403).json({ success: false, message: 'Only donor accounts can submit a donation record.' });
  }

  let donorQuery = supabaseAdmin.from('donors').select('id');
  donorQuery = profile.role === 'admin' && req.body.donor_id
    ? donorQuery.eq('id', req.body.donor_id)
    : donorQuery.eq('profile_id', profile.id);
  const { data: donor, error: donorError } = await donorQuery.maybeSingle();
  if (donorError) return res.status(500).json({ success: false, message: donorError.message });
  if (!donor) return res.status(404).json({ success: false, message: 'Complete donor registration before logging a donation.' });

  const { donation_date, units_donated, remarks } = req.body;
  if (!donation_date || (units_donated !== undefined && (Number(units_donated) <= 0 || Number(units_donated) > 2))) {
    return res.status(400).json({ success: false, message: 'A valid donation_date and donation amount are required.' });
  }
  const { data, error } = await supabaseAdmin.from('donations').insert({
    donor_id: donor.id,
    donation_date,
    units_donated: units_donated ?? 1,
    remarks: remarks || null,
    status: 'pending'
  }).select().single();
  if (error) return res.status(400).json({ success: false, message: error.message });
  return res.status(201).json({ success: true, data });
};
