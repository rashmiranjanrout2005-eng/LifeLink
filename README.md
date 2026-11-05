# Blood Bank Management System

This project contains a full-stack Blood Bank Management System with a React frontend, Express backend, Firebase Authentication, and Cloud Firestore.

## Project Structure

- frontend/
- backend/
- docs/

## Quick Start

1. Install Node.js 18+.
2. Install dependencies from the project root:

   ```powershell
   npm --prefix frontend install
   npm --prefix backend install
   ```

3. Configure Firebase:
   - Use the Firebase project configured in `frontend/src/firebase.js`, or set its web app values in `frontend/.env`.
   - Enable Email/Password and Google under Firebase Console → Authentication → Sign-in method.
   - Create a Cloud Firestore database and deploy `firestore.rules`.
   - Copy `backend/.env.example` to `backend/.env`; set `FIREBASE_PROJECT_ID` and `GOOGLE_APPLICATION_CREDENTIALS` to a service-account JSON file stored outside the repository. Never commit that credential file.
   - Ensure the frontend and backend use the same Firebase project.
   - Add `http://localhost:5173` and your deployed domain to Firebase Authentication's authorized domains.
4. To enable Google sign-in, enable the Google provider in Firebase Console → Authentication → Sign-in method.
5. Start the backend and frontend in separate PowerShell terminals:

   ```powershell
   cd backend
   npm run dev
   ```

   ```powershell
   cd frontend
   npm run dev
   ```

6. Open `http://localhost:5173`.

The UI has a local sample-data mode for exploring the public site without credentials. Sample stock and donor listings are marked as demo data; authentication, donor registration, requests, and persistent database operations require Firebase web configuration and backend Admin credentials. Set `USE_DEMO_MODE=false` and `NODE_ENV=production` in deployment environments.

### Database and API

- The Express API runs on `http://localhost:5000`; health check: `/api/health`.
- Firebase Authentication ID tokens protect backend API routes; user profiles and application records are stored in Firestore.
- Blood availability and donor search are public, read-only API endpoints.
- Donors, blood requests, donations, hospitals, notifications, and inventory are stored in Firestore; backend routes enforce authentication and role checks.
- New accounts cannot choose the administrator role. Promote a trusted user by updating that user's document in the Firestore `profiles` collection through Firebase Console.
- Existing Supabase data is not automatically copied; export and migrate it before switching any live deployment.

## Free Hosting

The site and API can be deployed together on Vercel Hobby ($0) with Firebase. Follow `docs/deployment-guide.md`; never expose the Firebase Admin service-account credential in a `VITE_*` variable.
