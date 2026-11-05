# Deployment Guide

1. Use the separate LifeLink GitHub repository; do not use the unrelated StudentMate repository.
2. In Firebase Console, enable Email/Password and Google under Authentication → Sign-in method, create a Cloud Firestore database, and add your production domain under Authentication → Settings → Authorized domains.
3. In Vercel, import the LifeLink repository on the **Hobby ($0)** plan. Do not start a Pro trial or add a payment method. Keep the project root directory set to the repository root; the root `vercel.json` builds the frontend, and `api/[...path].js` serves the Express backend for `/api/*`.
4. Add these environment variables in Vercel (Production, and Preview if desired):
   - `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_STORAGE_BUCKET`, `VITE_FIREBASE_MESSAGING_SENDER_ID`, and `VITE_FIREBASE_APP_ID`: Firebase web app configuration.
   - `VITE_API_URL`: `/api`.
   - `FIREBASE_PROJECT_ID`: Firebase project ID.
   - `FIREBASE_SERVICE_ACCOUNT`: complete service-account JSON encoded as a single-line JSON value for Firebase Admin SDK access. Keep it secret and never prefix it with `VITE_`.
   - `USE_DEMO_MODE`: `false`.
5. Deploy. The Vercel URL serves both the website and API; check `<Vercel URL>/api/health`.
6. Configure Firestore security rules from `firestore.rules`. The Express backend uses the Admin SDK; clients must not access the application collections directly.
7. Test the site from a phone, then verify email signup, Google sign-in, donor registration/search, stock availability, request submission/tracking, and administrator operations.

Vercel Hobby and Firebase Spark include no-cost usage tiers; check current limits before relying on the app for production or urgent medical needs.

Promote a trusted account to administrator by updating its `role` field in the Firestore `profiles` collection through a trusted Firebase Console session. Public registration cannot assign the `admin` role. Existing Supabase data is not automatically migrated to Firestore.
