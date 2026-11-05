# Deployment Guide

1. Use the separate LifeLink GitHub repository; do not use the unrelated StudentMate repository.
2. In Supabase, run all SQL files in `supabase/migrations/` in filename order and enable email/password authentication.
3. In Vercel, import the LifeLink repository on the **Hobby ($0)** plan. Do not start a Pro trial or add a payment method. Keep the project root directory set to the repository root; the root `vercel.json` builds the frontend, and `api/[...path].js` serves the Express backend for `/api/*`.
4. Add these environment variables in Vercel (Production, and Preview if desired):
   - `VITE_SUPABASE_URL`: Supabase project URL.
   - `VITE_SUPABASE_ANON_KEY`: Supabase anon/publishable key.
   - `VITE_API_URL`: `/api`.
   - `SUPABASE_URL`: same Supabase project URL.
   - `SUPABASE_ANON_KEY`: same anon/publishable key.
   - `SUPABASE_SERVICE_ROLE_KEY`: Supabase service-role key for backend-only operations. Never prefix this key with `VITE_`.
   - `USE_DEMO_MODE`: `false`.
5. Deploy. The Vercel URL serves both the website and API; check `<Vercel URL>/api/health`.
6. In Supabase Authentication → URL Configuration, set the Vercel URL as the Site URL and add `<Vercel URL>/auth/callback` to allowed redirect URLs. Keep `http://localhost:5173/auth/callback` for local development.
7. Google sign-in is optional. Configure a Google OAuth client, allow the Supabase callback URL shown by Supabase, and enter its client ID and secret in Supabase Authentication → Providers → Google.
8. Test the site from a phone, then verify email signup, Google sign-in if enabled, donor registration/search, stock availability, request submission/tracking, and administrator operations.

Vercel Hobby and Supabase Free are no-cost plans; no trial is required for this setup. Both providers enforce free-tier limits, and Supabase projects may pause after extended inactivity. Check each provider's current plan limits before relying on the app for production or urgent medical needs.

Promote a trusted account to administrator through a secure server-side Supabase operation only; never let a public registration request assign the `admin` role. RLS policies and API authorization checks depend on this distinction.
