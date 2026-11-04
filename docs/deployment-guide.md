# Deployment Guide

1. Push this project to its separate LifeLink GitHub repository. Do not use the unrelated StudentMate repository.
2. In Supabase, run every SQL migration in `supabase/migrations/` in filename order and enable email/password authentication.
3. In Render, create a Blueprint from the LifeLink repository's `main` branch. Render reads the root `render.yaml` and builds the frontend and backend into one web service.
4. Enter the requested Supabase settings in Render: project URL, anon/publishable key, and service-role key. The frontend settings use the URL and anon/publishable key; the service-role key is for the backend only. Never put it in a `VITE_` variable.
5. After Render deploys, open its service URL on a phone and check `<service URL>/api/health`.
6. In Supabase Authentication → URL Configuration, set the Render service URL as the Site URL and add `<service URL>/auth/callback` to the allowed redirect URLs. Keep `http://localhost:5173/auth/callback` for local development.
7. For Google sign-in, configure the Google OAuth client in Google Cloud Console, allow the Supabase callback URL shown by Supabase, then add its client ID and secret in Supabase Authentication → Providers → Google.
8. Test mobile layout, email signup/verification, Google sign-in, donor registration/search, stock availability, request submission/tracking, and role-protected admin operations.

The Render service serves the frontend and `/api` from the same public origin, so a separate Vercel project or cross-origin API configuration is not needed.

Promote a trusted account to administrator through a secure server-side Supabase operation only; never let a public registration request assign the `admin` role. RLS policies and API authorization checks depend on this distinction.

## Free-tier notes

- Supabase free tier has limits on project resources and database size.
- Render free tier may impose sleep time and usage constraints.
