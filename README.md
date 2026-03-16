# BrightMinds Institute CRM

BrightMinds Institute CRM is a comprehensive web-based Customer Relationship Management system designed specifically for educational institutes. Built with modern React 19, Vite, TypeScript, Tailwind CSS, and powered by Supabase for real-time database and authentication (including Google sign-in), it features a warm, family-first theme to foster engaging user experiences.

Key capabilities include:
- Dashboard with stats, activity feed, and quick actions
- Student management (view, add, edit, delete)
- Lead pipeline board and table
- Program and section cards
- Admissions tracking
- Backend admin panel for user and student management
- Demo data fallback and easy Vercel deployment

Whether managing student enrollments, tracking admissions, or monitoring engagement, BrightMinds CRM streamlines institute operations with intuitive UI and secure backend API support.

## Stack

- React 19
- Vite
- TypeScript
- Tailwind CSS
- Supabase

## Local run

```bash
npm install
npm run dev
```

`npm run dev` now starts both frontend and backend together.

Frontend only (optional):

```bash
npm run dev:frontend
```

Legacy full-stack alias (still available):

```bash
npm run dev:full
```

## Environment

Copy `.env.example` and add your Supabase values:

```bash
cp .env.example .env
```

Required variables:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_SUPABASE_REDIRECT_URL`
- `VITE_BACKEND_API_URL` (optional)

Use `http://localhost:5173` for the redirect URL in local development.
By default, backend calls use same-origin `/api/backend`. Set `VITE_BACKEND_API_URL` only if you host the API separately.

## Backend admin setup

Required serverless admin variables:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `BACKEND_ADMIN_EMAILS` (comma-separated allowlist for admin users; supports exact emails plus `@domain.com`, `*@domain.com`, or `*`)

The frontend `/backend` path uses the signed-in Supabase access token and calls the project `api/` routes to list/create/delete auth users, toggle user sign-in access, and create/delete student records securely. The parent portal at `/user` syncs directly against Supabase and stores a single-account household record with up to 20 children.

User records are persisted in `public.crm_backend_users`, and parent account state is stored in `public.crm_parent_portal_state`. Run the latest [`supabase/schema.sql`](./supabase/schema.sql) once in Supabase SQL Editor before using role-based admin access or server-backed parent sync.

## Vercel hosting

This project is configured for Vercel with:

- Vite frontend build
- SPA rewrites via [`vercel.json`](./vercel.json)
- Serverless backend functions under [`api/`](./api)

Set these Vercel Environment Variables:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `BACKEND_ADMIN_EMAILS`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_SUPABASE_REDIRECT_URL` (your Vercel domain)

After env vars are set, deploy with:

```bash
npx vercel --prod
```

## Supabase setup

1. Create the Supabase project.
2. In the SQL Editor, run [`supabase/schema.sql`](./supabase/schema.sql).
3. In Auth -> Providers -> Google, enable Google and add the redirect URL from `VITE_SUPABASE_REDIRECT_URL`.
4. In Google Cloud Console, add the same authorized redirect URL that Supabase shows for the Google provider.
5. Paste the project URL and anon key into `.env`.

## App structure

```text
src/
  components/
  hooks/
  layouts/
  pages/
  services/
  types/
  utils/
```

## Notes

- If Supabase is not configured, the UI falls back to realistic demo data.
- If Supabase is configured but the schema is missing, the app tells you to run the included SQL.
- If the CRM tables are protected behind authenticated RLS, the app can unlock live data after Google sign-in succeeds.
- When Supabase auth is configured, unauthenticated traffic is redirected to `/login`.
- Auth user administration is available at `/backend` through the Node backend API.
