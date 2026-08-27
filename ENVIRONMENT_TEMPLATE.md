# MAKANIbooking — Environment configuration

This document is the safe, version-controlled template for local development and Vercel. **Never commit `.env`, `.env.local`, or real secret values.** Copy the names below into the relevant environment and obtain values only from the official provider dashboards.

## 1. Local setup

Create `.env.local` locally from this document. The file is intentionally not generated or committed by the project. For a local Vercel-like runtime, use `B2RENT_RUNTIME_TARGET=vercel` and `B2RENT_AUTH_PROVIDER=supabase`.

## 2. Required independent Vercel runtime variables

| Variable | Required | Scope | Safe guidance |
|---|---:|---|---|
| `B2RENT_RUNTIME_TARGET` | Yes | Server | Set to `vercel` for the independent stack. |
| `B2RENT_AUTH_PROVIDER` | Yes | Server | Set to `supabase`. |
| `SUPABASE_URL` | Yes | Server | `https://<project-ref>.supabase.co`; not an OAuth URL. |
| `SUPABASE_DB_URL` | Yes | Server | Use the Supabase transaction/session pooler URL; keep the password secret. |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Server-only | Never expose it through `VITE_*`, GitHub, logs, or the browser. |
| `JWT_SECRET` | Yes | Server-only | Use a long random value; do not reuse a provider key. |
| `B2RENT_VERCEL_ADAPTERS_READY` | Yes before cutover | Server | Keep `false` until the production acceptance and rollback checks are approved; then set `true`. |

## 3. Supabase Auth browser variables

| Variable | Required | Scope | Safe guidance |
|---|---:|---|---|
| `VITE_SUPABASE_URL` | Yes | Public build | Same project URL as `SUPABASE_URL`. |
| `VITE_SUPABASE_ANON_KEY` | Yes | Public build | Publishable anon key only; never use the service-role key here. |
| `SUPABASE_ANON_KEY` | Optional alias | Server | Same anon key if server-side Auth helpers need it. |
| `SUPABASE_ADMIN_USER_IDS` | Optional | Server-only | Comma-separated approved admin IDs, if admin gating is configured. |

Google and Apple OAuth client secrets are configured in **Supabase Dashboard → Authentication → Providers**, not in this repository and not as `VITE_*` variables. Add the deployed callback/redirect URLs required by the app in Supabase Auth URL Configuration.

## 4. Database compatibility and migration variables

| Variable | Required while MySQL remains active | Scope |
|---|---:|---|
| `DATABASE_URL` | Yes for legacy MySQL runtime/rollback | Server-only |
| `SUPABASE_DB_URL` | Yes for PostgreSQL acceptance and cutover | Server-only |

The migration scripts are idempotent and preserve the MySQL source. Do not enable the adapter gate until the backup, schema comparison, row-count comparison, relationship checks, and smoke tests have passed.

## 5. Public application settings

| Variable | Required | Scope |
|---|---:|---|
| `VITE_APP_TITLE` | Recommended | Public build; use `MAKANIbooking`. |
| `VITE_APP_LOGO` | Optional | Public build; use the approved transparent logo URL. |
| `VITE_APP_URL` | Recommended | Public build; use the exact environment origin. |
| `VITE_GA4_MEASUREMENT_ID` | Optional | Public analytics identifier. |
| `VITE_META_PIXEL_ID` | Optional | Public analytics identifier. |

## 6. Optional server integrations

`SUPABASE_PRIVATE_STORAGE_BUCKET` defaults to `b2rent-private-documents`. `EMAIL_PROVIDER_API_KEY`, `EMAIL_FROM_ADDRESS`, `VISION_PROVIDER_API_KEY`, `CRON_SECRET`, and `B2RENT_STORAGE_ACCEPTANCE_TEST_ENABLED` are optional and should remain unset until their official services are configured. Their absence must not be hidden as a core runtime failure.

## 7. Legacy Manus compatibility

`VITE_APP_ID`, `VITE_OAUTH_PORTAL_URL`, `OAUTH_SERVER_URL`, `BUILT_IN_FORGE_API_URL`, `BUILT_IN_FORGE_API_KEY`, and `OWNER_OPEN_ID` belong to the legacy Manus path. Do not add or remove them from Vercel casually; remove them only after the independent Supabase stack has passed production acceptance and the rollback window has been agreed.

## 8. Vercel checklist

Add each variable under the correct Vercel environment, especially **Production**, and create a new deployment after changing values. Verify `/api/health` after deployment. Never paste secret values into GitHub issues, screenshots, chat, or client-side code. Keep `B2RENT_VERCEL_ADAPTERS_READY=false` until the final cutover decision is explicitly recorded.
