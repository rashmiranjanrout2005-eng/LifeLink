import dotenv from 'dotenv';
import { applicationDefault, cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

dotenv.config();

const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT;
const serviceAccount = serviceAccountJson
  ? JSON.parse(serviceAccountJson)
  : null;
const projectId = process.env.FIREBASE_PROJECT_ID || serviceAccount?.project_id;
const credential = serviceAccount
  ? cert({
      ...serviceAccount,
      private_key: serviceAccount.private_key?.replace(/\\n/g, '\n')
    })
  : process.env.GOOGLE_APPLICATION_CREDENTIALS
    ? applicationDefault()
    : null;

const firebaseApp = getApps()[0] || (credential
  ? initializeApp({ credential, ...(projectId ? { projectId } : {}) })
  : null);

export const isFirebaseConfigured = Boolean(firebaseApp);
export const firebaseAuth = firebaseApp ? getAuth(firebaseApp) : null;
export const firestore = firebaseApp ? getFirestore(firebaseApp) : null;
