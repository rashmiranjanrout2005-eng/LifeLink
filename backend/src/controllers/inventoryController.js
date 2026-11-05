import { isFirebaseConfigured } from '../config/firebase.js';
import { collection, documentData, now, unavailable } from '../utils/firestore.js';

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
const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export const getInventory = async (_req, res) => {
  if (!isFirebaseConfigured) return unavailable(res, 'Inventory');
  const snapshot = await collection('blood_units').limit(500).get();
  const data = snapshot.docs.map(documentData)
    .sort((a, b) => String(b.created_at || '').localeCompare(String(a.created_at || '')));
  return res.status(200).json({ success: true, data });
};

export const getAvailability = async (_req, res) => {
  if (!isFirebaseConfigured) {
    if (process.env.NODE_ENV === 'production') return unavailable(res, 'Blood availability');
    return res.status(200).json({ success: true, demo: true, data: demoAvailability });
  }
  const today = new Date().toISOString().slice(0, 10);
  const snapshot = await collection('blood_units').limit(1000).get();
  const counts = {};
  for (const unit of snapshot.docs.map(documentData)) {
    if (unit.screening_status === 'approved' && unit.unit_status === 'available' && unit.expiry_date >= today) {
      counts[unit.blood_group] = (counts[unit.blood_group] || 0) + 1;
    }
  }
  return res.status(200).json({
    success: true,
    data: bloodGroups.map((bloodGroup) => ({ bloodGroup, units: counts[bloodGroup] || 0 }))
  });
};

export const createInventory = async (req, res) => {
  if (!isFirebaseConfigured) return unavailable(res, 'Inventory');
  const { unit_id, blood_group, component, collection_date, expiry_date } = req.body;
  if (!unit_id || !blood_group || !component) {
    return res.status(400).json({ success: false, message: 'unit_id, blood_group, and component are required.' });
  }
  const duplicate = await collection('blood_units').where('unit_id', '==', unit_id).limit(1).get();
  if (!duplicate.empty) return res.status(409).json({ success: false, message: 'That unit_id already exists.' });
  const data = {
    unit_id, blood_group, component, collection_date: collection_date || null,
    expiry_date: expiry_date || null, screening_status: 'pending', storage_status: 'stored',
    unit_status: 'available', created_at: now(), updated_at: now()
  };
  const unitRef = collection('blood_units').doc();
  await unitRef.create(data);
  return res.status(201).json({ success: true, data: { id: unitRef.id, ...data } });
};

export const updateInventory = async (req, res) => {
  if (!isFirebaseConfigured) return unavailable(res, 'Inventory');
  const allowedFields = ['screening_status', 'storage_status', 'unit_status', 'expiry_date'];
  const updates = Object.fromEntries(Object.entries(req.body).filter(([key]) => allowedFields.includes(key)));
  if (!Object.keys(updates).length) {
    return res.status(400).json({ success: false, message: 'No valid inventory fields were provided.' });
  }
  const unitRef = collection('blood_units').doc(req.params.id);
  const snapshot = await unitRef.get();
  if (!snapshot.exists) return res.status(404).json({ success: false, message: 'Inventory unit not found.' });
  updates.updated_at = now();
  await unitRef.update(updates);
  return res.status(200).json({ success: true, data: { id: snapshot.id, ...snapshot.data(), ...updates } });
};
