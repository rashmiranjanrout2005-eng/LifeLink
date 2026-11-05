import { isFirebaseConfigured } from '../config/firebase.js';
import { getProfile, collection, now } from '../utils/firestore.js';

const roles = ['donor', 'hospital', 'patient'];

export const createProfile = async (req, res) => {
  if (!isFirebaseConfigured) {
    return res.status(503).json({ success: false, message: 'Authentication requires configured Firebase Admin credentials.' });
  }
  const { full_name, role = 'donor' } = req.body;
  if (!roles.includes(role) || (full_name !== undefined && String(full_name).trim().length > 100)) {
    return res.status(400).json({ success: false, message: 'A valid account role and full name are required.' });
  }

  const profileRef = collection('profiles').doc(req.user.uid);
  const existing = await profileRef.get();
  if (existing.exists) {
    return res.status(200).json({ success: true, user: { id: existing.id, ...existing.data() } });
  }

  const profile = {
    auth_user_id: req.user.uid,
    full_name: String(full_name || req.user.name || '').trim(),
    email: req.user.email || '',
    role,
    avatar_url: req.user.picture || null,
    is_verified: Boolean(req.user.email_verified),
    created_at: now(),
    updated_at: now()
  };
  try {
    await profileRef.create(profile);
    return res.status(201).json({ success: true, user: { id: profileRef.id, ...profile } });
  } catch (error) {
    if (error.code !== 6 && error.code !== 'already-exists') throw error;
    const existing = await getProfile(req.user.uid);
    return res.status(200).json({ success: true, user: existing });
  }
};

export const me = async (req, res) => {
  let profile = await getProfile(req.user.uid);
  if (!profile) {
    const profileRef = collection('profiles').doc(req.user.uid);
    const data = {
      auth_user_id: req.user.uid,
      full_name: req.user.name || '',
      email: req.user.email || '',
      role: 'donor',
      avatar_url: req.user.picture || null,
      is_verified: Boolean(req.user.email_verified),
      created_at: now(),
      updated_at: now()
    };
    try {
      await profileRef.create(data);
    } catch (error) {
      if (error.code !== 6 && error.code !== 'already-exists') throw error;
    }
    profile = await getProfile(req.user.uid);
  }
  return res.status(200).json({ success: true, user: profile });
};
