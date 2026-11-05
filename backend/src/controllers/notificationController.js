import { isFirebaseConfigured } from '../config/firebase.js';
import { collection, documentData, getProfile, now, unavailable } from '../utils/firestore.js';

export const getNotifications = async (req, res) => {
  if (!isFirebaseConfigured) return unavailable(res, 'Notifications');
  const profile = await getProfile(req.user.uid);
  if (!profile) return res.status(403).json({ success: false, message: 'A profile is required.' });
  const snapshot = await collection('notifications')
    .where('recipient_id', '==', profile.id)
    .limit(200)
    .get();
  const data = snapshot.docs.map(documentData)
    .sort((a, b) => String(b.created_at || '').localeCompare(String(a.created_at || '')))
    .slice(0, 100);
  return res.status(200).json({ success: true, data });
};

export const markNotificationRead = async (req, res) => {
  if (!isFirebaseConfigured) return unavailable(res, 'Notifications');
  const profile = await getProfile(req.user.uid);
  if (!profile) return res.status(403).json({ success: false, message: 'A profile is required.' });
  const notificationRef = collection('notifications').doc(req.params.id);
  const snapshot = await notificationRef.get();
  if (!snapshot.exists || snapshot.data().recipient_id !== profile.id) {
    return res.status(404).json({ success: false, message: 'Notification not found.' });
  }
  const updated_at = now();
  await notificationRef.update({ is_read: true, updated_at });
  return res.status(200).json({
    success: true,
    data: { id: snapshot.id, ...snapshot.data(), is_read: true, updated_at }
  });
};
