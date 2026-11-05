import { isFirebaseConfigured } from '../config/firebase.js';
import { collection, documentData, getProfile, now, unavailable } from '../utils/firestore.js';

export const getDonations = async (req, res) => {
  if (!isFirebaseConfigured) return unavailable(res, 'Donation history');
  const profile = await getProfile(req.user.uid);
  if (!profile) return res.status(403).json({ success: false, message: 'A profile is required.' });
  const snapshot = await collection('donations').limit(500).get();
  let donations = snapshot.docs.map(documentData);
  if (profile.role !== 'admin') {
    const donorSnapshot = await collection('donors').where('profile_id', '==', profile.id).limit(1).get();
    if (donorSnapshot.empty) return res.status(200).json({ success: true, data: [] });
    const donor = donorSnapshot.docs[0];
    donations = donations.filter((donation) => donation.donor_id === donor.id)
      .map((donation) => ({ ...donation, donors: { blood_group: donor.data().blood_group, profile_id: profile.id } }));
  } else {
    const donors = await collection('donors').limit(500).get();
    const byId = new Map(donors.docs.map((donor) => [donor.id, donor.data()]));
    donations = donations.map((donation) => ({
      ...donation,
      donors: byId.has(donation.donor_id)
        ? { blood_group: byId.get(donation.donor_id).blood_group, profile_id: byId.get(donation.donor_id).profile_id }
        : null
    }));
  }
  donations.sort((a, b) => String(b.donation_date || '').localeCompare(String(a.donation_date || '')));
  return res.status(200).json({ success: true, data: donations.slice(0, 100) });
};

export const createDonation = async (req, res) => {
  if (!isFirebaseConfigured) return unavailable(res, 'Donation records');
  const profile = await getProfile(req.user.uid);
  if (!profile || !['donor', 'admin'].includes(profile.role)) {
    return res.status(403).json({ success: false, message: 'Only donor accounts can submit a donation record.' });
  }
  const donors = collection('donors');
  let donorSnapshot;
  if (profile.role === 'admin' && req.body.donor_id) {
    const donor = await donors.doc(req.body.donor_id).get();
    donorSnapshot = donor.exists ? { docs: [donor], empty: false } : { docs: [], empty: true };
  } else {
    const results = await donors.where('profile_id', '==', profile.id).limit(1).get();
    donorSnapshot = results;
  }
  if (donorSnapshot.empty) {
    return res.status(404).json({ success: false, message: 'Complete donor registration before logging a donation.' });
  }
  const { donation_date, units_donated, remarks } = req.body;
  const units = units_donated === undefined ? 1 : Number(units_donated);
  if (!donation_date || !Number.isFinite(units) || units <= 0 || units > 2) {
    return res.status(400).json({ success: false, message: 'A valid donation_date and donation amount are required.' });
  }
  const data = {
    donor_id: donorSnapshot.docs[0].id,
    donation_date,
    units_donated: units,
    remarks: remarks || null,
    status: 'pending',
    created_at: now(),
    updated_at: now()
  };
  const donationRef = collection('donations').doc();
  await donationRef.create(data);
  return res.status(201).json({ success: true, data: { id: donationRef.id, ...data } });
};
