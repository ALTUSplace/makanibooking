# GitHub and Vercel automation handoff

## Current automated state

- The validated MAKANIbooking source is pushed to the private repository `kamalbouragba/makanibooking` on branch `main`.
- The repository retains the existing project history and contains no `.env` or `.env.local` file.
- GitHub Actions runs on every push and pull request to `main`.
- The quality workflow installs locked dependencies, runs `pnpm check`, runs `pnpm test`, and runs `pnpm build`.
- The existing public repository `kamalbouragba/b2-rent-morocco` was not overwritten because its history diverged from the current Manus project.

## Vercel access blocker

The Vercel Git integration could not see the new private repository and returned `repo_not_found`. This is an account-level GitHub App permission issue, not an application build failure. The Vercel team is `B2-Rent morocco` (`team_hjPMwDz7qyfSKcaWN2t5otJK`).

To unblock automatic deployments, the GitHub account owner must grant the Vercel GitHub App access to `kamalbouragba/makanibooking` from Vercel's Git integration settings. No code or secret value needs to be changed. After access is granted, the Vercel project should be linked to `kamalbouragba/makanibooking` with the project root at `/`, build command `pnpm build`, install command `pnpm install --frozen-lockfile`, and output directory `client/dist` if Vercel requests an explicit output directory.

## Production environment gate

The current runtime still uses Manus OAuth and a MySQL-compatible Drizzle adapter. Supabase health variables are present in the user's Vercel Production environment, but the OAuth variables were absent during the previous check. A Vercel deployment cannot support production login and booking until `OAUTH_SERVER_URL`, `VITE_OAUTH_PORTAL_URL`, and `VITE_APP_ID` are supplied from an official OAuth provider configuration, or the authentication implementation is migrated to Supabase Auth.

Do not place Supabase URLs in OAuth variables, do not enable system environment variables as a workaround, and do not deploy real payment credentials before a sandbox flow has been verified.
