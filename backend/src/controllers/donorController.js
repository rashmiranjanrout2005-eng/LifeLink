import { isFirebaseConfigured } from '../config/firebase.js';
import { collection, documentData, getProfile, now, unavailable } from '../utils/firestore.js';

const demoDonors = [
  { id: 'demo-donor-a', blood_group: 'O+', city: 'Berhampur', district: 'Ganjam', availability_status: 'available' },
  { id: 'demo-donor-b', blood_group: 'A+', city: 'Bhubaneswar', district: 'Khordha', availability_status: 'available' },
  { id: 'demo-donor-c', blood_group: 'B-', city: 'Cuttack', district: 'Cuttack', availability_status: 'available' }
];
const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export const getDonors = async (req, res) => {
  if (!isFirebaseConfigured) {
    if (process.env.NODE_ENV === 'production') return unavailable(res, 'Donor search');
    const filtered = demoDonors.filter((donor) =>
      (!req.query.bloodGroup || donor.blood_group === req.query.bloodGroup) &&
      (!req.query.city || donor.city.toLowerCase().includes(String(req.query.city).toLowerCase()))
    );
    return res.status(200).json({ success: true, demo: true, data: filtered });
  }

  const snapshot = await collection('donors').limit(500).get();
  const filters = req.query;
  const data = snapshot.docs.map(documentData)
    .filter((donor) => donor.availability_status === 'available' && donor.consent_status === true)
    .filter((donor) => !filters.bloodGroup || donor.blood_group === filters.bloodGroup)
    .filter((donor) => !filters.city || String(donor.city || '').toLowerCase().includes(String(filters.city).trim().toLowerCase()))
    .filter((donor) => !filters.district || String(donor.district || '').toLowerCase().includes(String(filters.district).trim().toLowerCase()))
    .filter((donor) => !filters.pincode || donor.pincode === String(filters.pincode).trim())
    .sort((a, b) => String(b.created_at || '').localeCompare(String(a.created_at || '')))
    .slice(0, 100)
    .map(({ id, blood_group, city, district, availability_status }) => ({ id, blood_group, city, district, availability_status }));
  return res.status(200).json({ success: true, data });
};

export const createDonor = async (req, res) => {
  if (!isFirebaseConfigured) return unavailable(res, 'Donor registration');
  const profile = await getProfile(req.user.uid);
  if (!profile) return res.status(403).json({ success: false, message: 'A profile is required.' });
  if (!['donor', 'admin'].includes(profile.role)) {
    return res.status(403).json({ success: false, message: 'Only donor accounts can create a donor profile.' });
  }
  const { blood_group, city, district, pincode, last_donation_date } = req.body;
  if (!bloodGroups.includes(blood_group)) {
    return res.status(400).json({ success: false, message: 'A valid blood_group is required.' });
  }

  const donors = collection('donors');
  const existing = await donors.where('profile_id', '==', profile.id).limit(1).get();
  const donorRef = existing.empty ? donors.doc() : existing.docs[0].ref;
  const previous = existing.empty ? {} : existing.docs[0].data();
  const data = {
    ...previous,
    profile_id: profile.id,
    blood_group,
    city: city || '',
    district: district || '',
    pincode: pincode || '',
    last_donation_date: last_donation_date || null,
    availability_status: previous.availability_status || 'available',
    consent_status: previous.consent_status ?? true,
    created_at: previous.created_at || now(),
    updated_at: now()
  };
  await donorRef.set(data);
  return res.status(existing.empty ? 201 : 200).json({ success: true, data: { id: donorRef.id, ...data } });
};

export const updateDonor = async (req, res) => {
  if (!isFirebaseConfigured) return unavailable(res, 'Donor updates');
  const profile = await getProfile(req.user.uid);
  if (!profile) return res.status(403).json({ success: false, message: 'A profile is required.' });
  const donorRef = collection('donors').doc(req.params.id);
  const snapshot = await donorRef.get();
  if (!snapshot.exists || (profile.role !== 'admin' && snapshot.data().profile_id !== profile.id)) {
    return res.status(404).json({ success: false, message: 'Donor record not found.' });
  }
  const allowedFields = ['city', 'district', 'pincode', 'availability_status', 'last_donation_date', 'consent_status'];
  const updates = Object.fromEntries(Object.entries(req.body).filter(([key]) => allowedFields.includes(key)));
  if (!Object.keys(updates).length) return res.status(400).json({ success: false, message: 'No valid donor fields were provided.' });
  updates.updated_at = now();
  await donorRef.update(updates);
  return res.status(200).json({ success: true, data: { id: snapshot.id, ...snapshot.data(), ...updates } });
};

export const deleteDonor = async (req, res) => {
  if (!isFirebaseConfigured) return unavailable(res, 'Donor deletion');
  const profile = await getProfile(req.user.uid);
  if (profile?.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Only administrators can delete donor records.' });
  }
  const donorRef = collection('donors').doc(req.params.id);
  const snapshot = await donorRef.get();
  if (!snapshot.exists) return res.status(404).json({ success: false, message: 'Donor record not found.' });
  await donorRef.delete();
  return res.status(200).json({ success: true, message: 'Donor deleted.' });
};
