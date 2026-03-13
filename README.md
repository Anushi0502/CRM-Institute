# BrightMinds Institute CRM

A React + Vite + TypeScript CRM for an education institute, styled with a warm family-first theme and wired for Supabase data plus Google sign-in.

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
npm run backend:dev
```

Run both together (recommended):

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

Copy backend env values:

```bash
cp backend/.env.example .env.backend
```

Required backend variables:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `BACKEND_PORT`
- `BACKEND_ADMIN_EMAILS` (comma-separated allowlist for admin users)

Run backend API:

```bash
npm run backend:dev
```

The frontend `/backend` path uses the signed-in Supabase access token and calls this API to list/create/delete auth users, toggle user sign-in access, and create/delete student records securely.

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
