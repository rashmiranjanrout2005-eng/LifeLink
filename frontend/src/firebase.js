import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyCGEITeLm5P8pN7mVqARWysTdP0InNtjVo',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'lifelink-8362a.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'lifelink-8362a',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'lifelink-8362a.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '926183159112',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:926183159112:web:b01e46d9ae7df2969caf7d'
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const isFirebaseConfigured = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId);

export default app;