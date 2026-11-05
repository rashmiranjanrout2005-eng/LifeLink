import { isFirebaseConfigured } from '../config/firebase.js';
import { collection, documentData, getProfile, now, unavailable } from '../utils/firestore.js';

export const getHospitals = async (req, res) => {
  if (!isFirebaseConfigured) return unavailable(res, 'Hospital directory');
  const profile = await getProfile(req.user.uid);
  const snapshot = await collection('hospitals').limit(500).get();
  const data = snapshot.docs.map(documentData)
    .filter((hospital) => profile?.role === 'admin' || hospital.profile_id === profile?.id)
    .sort((a, b) => String(a.hospital_name || '').localeCompare(String(b.hospital_name || '')))
    .slice(0, 100);
  return res.status(200).json({ success: true, data });
};

export const createHospital = async (req, res) => {
  if (!isFirebaseConfigured) return unavailable(res, 'Hospital registration');
  const profile = await getProfile(req.user.uid);
  if (!profile || !['hospital', 'admin'].includes(profile.role)) {
    return res.status(403).json({ success: false, message: 'Register a hospital account before creating a hospital profile.' });
  }
  const { hospital_name, license_number, address, city, district, phone } = req.body;
  if (!hospital_name || !String(hospital_name).trim()) {
    return res.status(400).json({ success: false, message: 'hospital_name is required.' });
  }
  const hospitals = collection('hospitals');
  const existing = await hospitals.where('profile_id', '==', profile.id).limit(1).get();
  const hospitalRef = existing.empty ? hospitals.doc() : existing.docs[0].ref;
  const previous = existing.empty ? {} : existing.docs[0].data();
  const data = {
    ...previous, profile_id: profile.id, hospital_name: String(hospital_name).trim(),
    license_number: license_number || '', address: address || '', city: city || '',
    district: district || '', phone: phone || '', is_verified: previous.is_verified || false,
    created_at: previous.created_at || now(), updated_at: now()
  };
  await hospitalRef.set(data);
  return res.status(existing.empty ? 201 : 200).json({ success: true, data: { id: hospitalRef.id, ...data } });
};

export const updateHospital = async (req, res) => {
  if (!isFirebaseConfigured) return unavailable(res, 'Hospital updates');
  const profile = await getProfile(req.user.uid);
  if (!profile) return res.status(403).json({ success: false, message: 'A profile is required.' });
  const hospitalRef = collection('hospitals').doc(req.params.id);
  const snapshot = await hospitalRef.get();
  if (!snapshot.exists || (profile.role !== 'admin' && snapshot.data().profile_id !== profile.id)) {
    return res.status(404).json({ success: false, message: 'Hospital not found.' });
  }
  const fields = ['hospital_name', 'license_number', 'address', 'city', 'district', 'phone'];
  const updates = Object.fromEntries(Object.entries(req.body).filter(([key]) => fields.includes(key)));
  if (!Object.keys(updates).length) return res.status(400).json({ success: false, message: 'No valid hospital fields were provided.' });
  updates.updated_at = now();
  await hospitalRef.update(updates);
  return res.status(200).json({ success: true, data: { id: snapshot.id, ...snapshot.data(), ...updates } });
};
