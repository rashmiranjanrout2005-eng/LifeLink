import { isSupabaseConfigured, supabaseAdmin } from '../config/supabase.js';

const unavailable = (res) => res.status(503).json({
  success: false,
  message: 'Dashboard data requires a configured Supabase database.'
});

export const getStats = async (_req, res) => {
  if (!isSupabaseConfigured) return unavailable(res);
  const today = new Date().toISOString().slice(0, 10);
  const [donors, hospitals, units, requests] = await Promise.all([
    supabaseAdmin.from('donors').select('id', { count: 'exact', head: true }),
    supabaseAdmin.from('hospitals').select('id', { count: 'exact', head: true }),
    supabaseAdmin.from('blood_units').select('id', { count: 'exact', head: true })
      .eq('screening_status', 'approved').eq('unit_status', 'available').gte('expiry_date', today),
    supabaseAdmin.from('blood_requests').select('id', { count: 'exact', head: true }).eq('request_status', 'pending')
  ]);
  const result = [donors, hospitals, units, requests].find(({ error }) => error);
  if (result?.error) return res.status(500).json({ success: false, message: result.error.message });
  return res.status(200).json({
    success: true,
    data: {
      donors: donors.count ?? 0,
      hospitals: hospitals.count ?? 0,
      bloodUnits: units.count ?? 0,
      pendingRequests: requests.count ?? 0
    }
  });
};

export const getCharts = async (_req, res) => {
  if (!isSupabaseConfigured) return unavailable(res);
  const since = new Date();
  since.setMonth(since.getMonth() - 5, 1);
  const today = new Date().toISOString().slice(0, 10);
  const [donationsResult, stockResult] = await Promise.all([
    supabaseAdmin.from('donations').select('donation_date, units_donated').gte('donation_date', since.toISOString().slice(0, 10)).eq('status', 'completed'),
    supabaseAdmin.from('blood_units').select('blood_group').eq('screening_status', 'approved')
      .eq('unit_status', 'available').gte('expiry_date', today)
  ]);
  if (donationsResult.error) return res.status(500).json({ success: false, message: donationsResult.error.message });
  if (stockResult.error) return res.status(500).json({ success: false, message: stockResult.error.message });

  const monthFormatter = new Intl.DateTimeFormat('en', { month: 'short' });
  const monthly = new Map();
  for (let offset = 5; offset >= 0; offset -= 1) {
    const date = new Date();
    date.setDate(1);
    date.setMonth(date.getMonth() - offset);
    monthly.set(`${date.getFullYear()}-${date.getMonth()}`, {
      month: monthFormatter.format(date),
      value: 0
    });
  }
  for (const donation of donationsResult.data || []) {
    const date = new Date(`${donation.donation_date}T00:00:00`);
    const entry = monthly.get(`${date.getFullYear()}-${date.getMonth()}`);
    if (entry) entry.value += Number(donation.units_donated || 0);
  }

  const groupCounts = (stockResult.data || []).reduce((result, item) => {
    result[item.blood_group] = (result[item.blood_group] || 0) + 1;
    return result;
  }, {});
  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  return res.status(200).json({
    success: true,
    data: {
      donations: [...monthly.values()],
      bloodGroups: bloodGroups.map((name) => ({ name, value: groupCounts[name] || 0 }))
    }
  });
};
