import { isFirebaseConfigured } from '../config/firebase.js';
import { collection, documentData, unavailable } from '../utils/firestore.js';

const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export const getStats = async (_req, res) => {
  if (!isFirebaseConfigured) return unavailable(res, 'Dashboard data');
  const [donors, hospitals, units, requests] = await Promise.all([
    collection('donors').count().get(),
    collection('hospitals').count().get(),
    collection('blood_units').get(),
    collection('blood_requests').get()
  ]);
  const today = new Date().toISOString().slice(0, 10);
  const availableUnits = units.docs.map(documentData).filter((unit) =>
    unit.screening_status === 'approved' && unit.unit_status === 'available' && unit.expiry_date >= today
  ).length;
  const pendingRequests = requests.docs.map(documentData)
    .filter((request) => (request.request_status || 'pending') === 'pending').length;
  return res.status(200).json({
    success: true,
    data: {
      donors: donors.data().count,
      hospitals: hospitals.data().count,
      bloodUnits: availableUnits,
      pendingRequests
    }
  });
};

export const getCharts = async (_req, res) => {
  if (!isFirebaseConfigured) return unavailable(res, 'Dashboard data');
  const [donationsSnapshot, unitsSnapshot] = await Promise.all([
    collection('donations').limit(2000).get(),
    collection('blood_units').limit(2000).get()
  ]);
  const since = new Date();
  since.setMonth(since.getMonth() - 5, 1);
  const monthFormatter = new Intl.DateTimeFormat('en', { month: 'short' });
  const monthly = new Map();
  for (let offset = 5; offset >= 0; offset -= 1) {
    const date = new Date();
    date.setDate(1);
    date.setMonth(date.getMonth() - offset);
    monthly.set(`${date.getFullYear()}-${date.getMonth()}`, { month: monthFormatter.format(date), value: 0 });
  }
  for (const donation of donationsSnapshot.docs.map(documentData)) {
    if (donation.status !== 'completed' || !donation.donation_date) continue;
    const date = new Date(`${donation.donation_date}T00:00:00`);
    if (date < since) continue;
    const entry = monthly.get(`${date.getFullYear()}-${date.getMonth()}`);
    if (entry) entry.value += Number(donation.units_donated || 0);
  }

  const today = new Date().toISOString().slice(0, 10);
  const groupCounts = {};
  for (const unit of unitsSnapshot.docs.map(documentData)) {
    if (unit.screening_status === 'approved' && unit.unit_status === 'available' && unit.expiry_date >= today) {
      groupCounts[unit.blood_group] = (groupCounts[unit.blood_group] || 0) + 1;
    }
  }
  return res.status(200).json({
    success: true,
    data: {
      donations: [...monthly.values()],
      bloodGroups: bloodGroups.map((name) => ({ name, value: groupCounts[name] || 0 }))
    }
  });
};
