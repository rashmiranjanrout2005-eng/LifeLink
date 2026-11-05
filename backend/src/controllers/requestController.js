import { firestore, isFirebaseConfigured } from '../config/firebase.js';
import { collection, documentData, getProfile, now, unavailable } from '../utils/firestore.js';

const validBloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export const getRequests = async (req, res) => {
  if (!isFirebaseConfigured) return unavailable(res, 'Blood requests');
  const profile = await getProfile(req.user.uid);
  if (!profile) return res.status(403).json({ success: false, message: 'A profile is required.' });
  const snapshot = await collection('blood_requests').limit(500).get();
  const data = snapshot.docs.map(documentData)
    .filter((request) => profile.role === 'admin' || request.requester_id === profile.id)
    .sort((a, b) => String(b.created_at || '').localeCompare(String(a.created_at || '')))
    .slice(0, 100);
  return res.status(200).json({ success: true, data });
};

export const createRequest = async (req, res) => {
  if (!isFirebaseConfigured) return unavailable(res, 'Blood requests');
  const profile = await getProfile(req.user.uid);
  if (!profile) return res.status(403).json({ success: false, message: 'A profile is required.' });
  const {
    patient_name, blood_group, blood_component, units_required, required_date,
    hospital_address, contact_information, emergency_level, reason, hospital_id
  } = req.body;
  const units = Number(units_required);
  if (!patient_name || !blood_group || !blood_component || !Number.isInteger(units) || units < 1) {
    return res.status(400).json({ success: false, message: 'patient_name, blood_group, blood_component, and a positive units_required value are required.' });
  }
  if (!validBloodGroups.includes(blood_group)) {
    return res.status(400).json({ success: false, message: 'A valid blood group is required.' });
  }

  const data = {
    requester_id: profile.id,
    hospital_id: hospital_id || null,
    patient_name: String(patient_name).trim(),
    blood_group,
    blood_component,
    units_required: units,
    required_date: required_date || null,
    hospital_address: hospital_address || null,
    contact_information: contact_information || null,
    emergency_level: ['normal', 'urgent', 'emergency'].includes(emergency_level) ? emergency_level : 'normal',
    reason: reason || null,
    request_status: 'pending',
    created_at: now(),
    updated_at: now()
  };
  const requestRef = collection('blood_requests').doc();
  await requestRef.create(data);
  return res.status(201).json({ success: true, data: { id: requestRef.id, ...data } });
};

export const getRequestById = async (req, res) => {
  if (!isFirebaseConfigured) return unavailable(res, 'Blood requests');
  const profile = await getProfile(req.user.uid);
  if (!profile) return res.status(403).json({ success: false, message: 'A profile is required.' });
  const snapshot = await collection('blood_requests').doc(req.params.id).get();
  if (!snapshot.exists || (profile.role !== 'admin' && snapshot.data().requester_id !== profile.id)) {
    return res.status(404).json({ success: false, message: 'Request not found.' });
  }
  return res.status(200).json({ success: true, data: documentData(snapshot) });
};

export const updateRequestStatus = async (req, res) => {
  if (!isFirebaseConfigured) return unavailable(res, 'Blood requests');
  const allowedStatuses = ['under_review', 'approved', 'rejected', 'reserved', 'fulfilled', 'cancelled'];
  if (!allowedStatuses.includes(req.body.status)) {
    return res.status(400).json({ success: false, message: 'A valid request status is required.' });
  }
  const requestRef = collection('blood_requests').doc(req.params.id);
  const historyRef = collection('request_history').doc();
  const updatedAt = now();
  const updated = await firestore.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(requestRef);
    if (!snapshot.exists) return null;
    const previousStatus = snapshot.data().request_status || 'pending';
    const data = { ...snapshot.data(), id: snapshot.id, request_status: req.body.status, updated_at: updatedAt };
    transaction.update(requestRef, { request_status: req.body.status, updated_at: updatedAt });
    transaction.create(historyRef, {
      request_id: snapshot.id,
      previous_status: previousStatus,
      new_status: req.body.status,
      updated_by: req.profile?.id || req.user.uid,
      note: req.body.note || null,
      created_at: updatedAt
    });
    return data;
  });
  if (!updated) return res.status(404).json({ success: false, message: 'Request not found.' });
  return res.status(200).json({ success: true, data: updated });
};
