import { firestore } from '../config/firebase.js';

export const collection = (name) => firestore.collection(name);
export const now = () => new Date().toISOString();
export const documentData = (snapshot) => ({ id: snapshot.id, ...snapshot.data() });

export async function getProfile(userId) {
  const snapshot = await collection('profiles').doc(userId).get();
  return snapshot.exists ? documentData(snapshot) : null;
}

export function unavailable(res, feature) {
  return res.status(503).json({
    success: false,
    message: `${feature} requires configured Firebase Admin credentials.`
  });
}
