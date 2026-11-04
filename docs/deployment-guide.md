# Deployment Guide

1. Create a separate GitHub repository for LifeLink and push this project to it. Do not use the unrelated StudentMate repository.
2. In Supabase, run every SQL migration in `supabase/migrations/` in filename order. Enable email/password authentication.
3. In Render, create a Blueprint from the repository. Render reads the root `render.yaml` and asks for the Supabase URL, anon key, service-role key, and frontend origin. Keep the service-role key in Render only.
4. After the Render API deploys, copy its public origin (for example, `https://lifelink-api.onrender.com`) and check `<API origin>/api/health`.
5. In Vercel, import the same GitHub repository and set the project root directory to `frontend`. Add these build environment variables:
   - `VITE_SUPABASE_URL`: Supabase project URL.
   - `VITE_SUPABASE_ANON_KEY`: Supabase anon/publishable key.
   - `VITE_API_URL`: Render API origin followed by `/api`.
6. After Vercel deploys, set Render's `FRONTEND_URL` to the exact Vercel site origin (without a trailing slash), then redeploy the API.
7. In Supabase Authentication → URL Configuration, set the production site as the Site URL and allow both `http://localhost:5173/auth/callback` and `<Vercel site origin>/auth/callback`.
8. For Google sign-in, configure the Google OAuth client in Google Cloud Console, allow the Supabase callback URL shown by Supabase, then add its client ID and secret in Supabase Authentication → Providers → Google.
9. Test mobile layout, email signup/verification, Google sign-in, donor registration/search, stock availability, request submission/tracking, role-protected admin operations, and the API health endpoint.

The `frontend/vercel.json` rewrite supports client-side routes such as `/auth/callback` when opened directly. Never place the backend service-role key in a Vercel variable beginning with `VITE_`.

Promote a trusted account to administrator through a secure server-side Supabase operation only; never let a public registration request assign the `admin` role. RLS policies and API authorization checks depend on this distinction.

## Free-tier notes

- Supabase free tier has limits on project resources and database size.
- Vercel free tier includes limited build minutes and bandwidth.
- Render free tier may impose sleep time and usage constraints.
