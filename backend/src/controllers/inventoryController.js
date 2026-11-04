import { isSupabaseConfigured, supabaseAdmin } from '../config/supabase.js';

const demoAvailability = [
  { bloodGroup: 'A+', units: 12 },
  { bloodGroup: 'A-', units: 0 },
  { bloodGroup: 'B+', units: 0 },
  { bloodGroup: 'B-', units: 0 },
  { bloodGroup: 'AB+', units: 0 },
  { bloodGroup: 'AB-', units: 0 },
  { bloodGroup: 'O+', units: 18 },
  { bloodGroup: 'O-', units: 0 }
];

const databaseUnavailable = (res) => res.status(503).json({
  success: false,
  message: 'Database is not configured. Add Supabase credentials and run the migrations.'
});

export const getInventory = async (req, res) => {
  if (!isSupabaseConfigured) return databaseUnavailable(res);

  const { data, error } = await supabaseAdmin
    .from('blood_units')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return res.status(500).json({ success: false, message: error.message });
  return res.status(200).json({ success: true, data });
};

export const getAvailability = async (_req, res) => {
  if (!isSupabaseConfigured) {
    if (process.env.NODE_ENV === 'production') return databaseUnavailable(res);
    return res.status(200).json({ success: true, demo: true, data: demoAvailability });
  }

  const today = new Date().toISOString().slice(0, 10);
  const { data, error } = await supabaseAdmin
    .from('blood_units')
    .select('blood_group')
    .eq('screening_status', 'approved')
    .eq('unit_status', 'available')
    .gte('expiry_date', today);

  if (error) return res.status(500).json({ success: false, message: error.message });
  const counts = (data || []).reduce((result, item) => {
    result[item.blood_group] = (result[item.blood_group] || 0) + 1;
    return result;
  }, {});
  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  return res.status(200).json({
    success: true,
    data: bloodGroups.map((bloodGroup) => ({ bloodGroup, units: counts[bloodGroup] || 0 }))
  });
};

export const createInventory = async (req, res) => {
  if (!isSupabaseConfigured) return databaseUnavailable(res);
  const { unit_id, blood_group, component, collection_date, expiry_date } = req.body;
  if (!unit_id || !blood_group || !component) {
    return res.status(400).json({ success: false, message: 'unit_id, blood_group, and component are required.' });
  }

  const { data, error } = await supabaseAdmin
    .from('blood_units')
    .insert({ unit_id, blood_group, component, collection_date, expiry_date })
    .select()
    .single();

  if (error) return res.status(400).json({ success: false, message: error.message });
  return res.status(201).json({ success: true, data });
};

export const updateInventory = async (req, res) => {
  if (!isSupabaseConfigured) return databaseUnavailable(res);
  const allowedFields = ['screening_status', 'storage_status', 'unit_status', 'expiry_date'];
  const updates = Object.fromEntries(
    Object.entries(req.body).filter(([key]) => allowedFields.includes(key))
  );
  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ success: false, message: 'No valid inventory fields were provided.' });
  }

  const { data, error } = await supabaseAdmin
    .from('blood_units')
    .update(updates)
    .eq('id', req.params.id)
    .select()
    .maybeSingle();

  if (error) return res.status(400).json({ success: false, message: error.message });
  if (!data) return res.status(404).json({ success: false, message: 'Inventory unit not found.' });
  return res.status(200).json({ success: true, data });
};
