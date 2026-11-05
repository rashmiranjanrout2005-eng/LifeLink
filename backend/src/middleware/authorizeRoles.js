import { firestore, isFirebaseConfigured } from '../config/firebase.js';

export const authorizeRoles = (...roles) => async (req, res, next) => {
  if (req.user?.demoMode && roles.includes('admin')) return next();
  if (!isFirebaseConfigured) {
    return res.status(503).json({ success: false, message: 'Role authorization requires configured Firebase credentials.' });
  }

  const profileSnapshot = await firestore.collection('profiles').doc(req.user.uid).get();
  const profile = profileSnapshot.exists ? { id: profileSnapshot.id, ...profileSnapshot.data() } : null;
  if (!profile || !roles.includes(profile.role)) {
    return res.status(403).json({ success: false, message: 'You do not have permission to perform this action.' });
  }

  req.profile = profile;
  next();
};
