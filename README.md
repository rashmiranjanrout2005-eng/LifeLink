# Blood Bank Management System

This project contains a full-stack Blood Bank Management System with a React frontend, Express backend, Supabase database, and deployment instructions.

## Project Structure

- frontend/
- backend/
- supabase/
- docs/

## Quick Start

1. Install Node.js 18+.
2. Install dependencies from the project root:

   ```powershell
   npm --prefix frontend install
   npm --prefix backend install
   ```

3. Configure Supabase:
   - Create a Supabase project.
   - Run every SQL migration in `supabase/migrations/` in filename order.
   - Copy `frontend/.env.example` to `frontend/.env` and set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
   - Copy `backend/.env.example` to `backend/.env` and set `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY`.
   - Keep the backend service-role key secret; never add it to a `VITE_*` variable or commit it.
4. To enable Google sign-in:
   - Configure the Google provider in Supabase Authentication → Providers.
   - In Google Cloud Console, allow the Supabase OAuth callback URL shown by Supabase as an authorized redirect URI.
   - In Supabase Authentication → URL Configuration, allow `http://localhost:5173/auth/callback` and your deployed site's `/auth/callback` URL.
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

The UI has a local sample-data mode for exploring the public site without credentials. Sample stock and donor listings are marked as demo data; authentication, donor registration, requests, and persistent database operations require a configured Supabase project. Set `USE_DEMO_MODE=false` and `NODE_ENV=production` in deployment environments.

### Google OAuth setup

In the Google Cloud Console, create an OAuth client ID for a web application and add Supabase's OAuth callback URL as an authorized redirect URI. Enter the Google client ID and secret in the Supabase Google provider settings. Add `http://localhost:5173/auth/callback` and the deployed site's `/auth/callback` to Supabase's allowed redirect URLs. The app starts the OAuth flow through Supabase, sends users to its dedicated callback route, and does not store Google client secrets.

### Database and API

- The Express API runs on `http://localhost:5000`; health check: `/api/health`.
- Supabase Auth creates a matching `profiles` record through the auth-user trigger in migration `010`.
- Blood availability and donor search are public, read-only API endpoints.
- Donor profiles, blood requests, donations, hospitals, notifications, and inventory are backed by Supabase queries. Blood request status and history are updated atomically by the migration `011` RPC.
- Row-level security policies are defined in migrations `009`–`011`. The backend service-role key bypasses RLS, so protected API routes enforce authentication and role checks.
- To promote an administrator, use the Supabase SQL editor as a trusted project owner: `update public.profiles set role = 'admin' where email = 'trusted-account@example.com';`. Never expose an admin role selector in public signup.

## Free Hosting

The site and API can be deployed together on Vercel Hobby ($0) with Supabase Free for authentication and database storage. No paid trial or payment method is required for this setup. Follow `docs/deployment-guide.md`; never expose the Supabase service-role key in a `VITE_*` variable.
