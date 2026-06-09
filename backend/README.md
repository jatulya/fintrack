# FinTrack Backend

JWT authentication powered by **Supabase Auth**, following **repository → service → controller** architecture.

## Setup

1. **Create a Supabase project** at [supabase.com](https://supabase.com)

2. **Run the migration** — Supabase Dashboard → SQL Editor → run:
   `supabase/migrations/001_auth.sql`

3. **Configure environment**

   ```bash
   cp .env.example .env
   ```

   From Supabase → Settings → API, copy:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY` (public — used for sign-in/refresh on server)
   - `SUPABASE_SERVICE_ROLE_KEY` (secret — server only, never expose to frontend)

4. **Install & run**
   ```bash
   npm install
   npm run dev
   ```

## How auth works

- **Supabase Auth** manages users (`auth.users`), password hashing, and refresh tokens
- No custom `users` or `refresh_tokens` tables — Supabase handles sessions internally
- Optional `profiles` table extends `auth.users` with `full_name`
- Backend returns Supabase **access token** in JSON; **refresh token** in httpOnly cookie
- Protected routes validate tokens via `supabase.auth.getUser()`

## Security

- Passwords hashed by Supabase (bcrypt) — never stored in app code
- Credentials sent via **POST JSON body** only — never in URL/query params
- Input validation & HTML escaping via **express-validator**
- **Helmet**, **CORS** whitelist, **rate limiting** on auth routes
- Service role key stays server-side only

## Architecture

```
src/modules/auth/
  auth.repository.ts   → Supabase Auth + profiles queries
  auth.service.ts      → Business logic, session mapping
  auth.controller.ts   → HTTP request/response, cookies
  auth.routes.ts       → Route definitions
  auth.validation.ts   → Input validation rules
```
