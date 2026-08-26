# MAKANIbooking environment template

This document lists the variable names and safe defaults required for local development and Vercel. **Do not paste secret values into this file, commit `.env` files, or share screenshots containing values.**

## Runtime

| Variable | Example or default | Scope |
|---|---|---|
| `NODE_ENV` | `development` | Server |
| `PORT` | `3000` | Server |
| `B2RENT_RUNTIME_TARGET` | `manus` or `vercel` | Server |

## Current authentication implementation

| Variable | Required | Scope |
|---|---|---|
| `VITE_APP_ID` | Yes for Manus OAuth | Public build configuration |
| `VITE_OAUTH_PORTAL_URL` | Yes for Manus OAuth | Public build configuration |
| `OAUTH_SERVER_URL` | Yes for Manus OAuth | Server only |
| `AUTH_REDIRECT_URI` | Yes; use the exact deployed callback URL | Server only |
| `JWT_SECRET` | Yes | Server only |

## Current application database

The runtime currently imports `drizzle-orm/mysql2` and the schema uses `mysqlTable`, so the existing application database remains MySQL-compatible until the PostgreSQL adapter migration is completed.

| Variable | Required | Scope |
|---|---|---|
| `DATABASE_URL` | Required by the current Drizzle runtime | Server only |

## Supabase migration and acceptance layer

| Variable | Required | Scope |
|---|---|---|
| `SUPABASE_URL` | Yes for Supabase health/storage acceptance | Server; public only when using a separate anon key |
| `SUPABASE_DB_URL` | Required for PostgreSQL migration work | Server only |
| `SUPABASE_SERVICE_ROLE_KEY` | Required for server-side administrative acceptance checks | Server only |
| `SUPABASE_PRIVATE_STORAGE_BUCKET` | Optional; default `b2rent-private-documents` | Server |

## Existing service integrations

`BUILT_IN_FORGE_API_URL`, `BUILT_IN_FORGE_API_KEY`, `OWNER_OPEN_ID`, `EMAIL_PROVIDER_API_KEY`, `EMAIL_FROM_ADDRESS`, `VISION_PROVIDER_API_KEY`, and `CRON_SECRET` are optional or feature-specific. They must be supplied only from their official providers and must remain server-side unless explicitly documented as public.

## Public application configuration

`VITE_APP_TITLE=MAKANIbooking`, `VITE_APP_LOGO`, `VITE_APP_URL`, `VITE_GA4_MEASUREMENT_ID`, and `VITE_META_PIXEL_ID` are build-time/public settings. Analytics identifiers are not secrets, but they should still be configured deliberately per environment.

## Vercel checklist

Every required variable must be added under the correct Vercel environment, especially **Production**, and a new deployment must be created after changing variables. Do not use the Supabase URL as an OAuth URL. The current application cannot accept production logins on Vercel until the Manus OAuth variables are supplied or the authentication implementation is migrated to an independent provider.
