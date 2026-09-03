# SignalDesk backend setup

The repository contains the production foundation for authentication, workspace isolation, read-only Google reporting and AI recommendations. It remains in demo mode when environment variables are absent.

## Deployment log

- September 1, 2026: created the dedicated `signaldesk-crm` Supabase project in the South America (São Paulo) region.
- September 1, 2026: applied `supabase/migrations/202609010001_initial_crm.sql` successfully through the Supabase SQL Editor.
- September 1, 2026: sent the Supabase invitation to `josel.demoya@gmail.com`; Supabase currently shows `Waiting for verification`.
- September 1, 2026: created the `ClubGamerZone` workspace (`clubgamerzone`) and assigned the invited user the `owner` role. A verification query returned one matching user, one workspace and one owner membership.
- September 1, 2026: the invitation confirmed the user, but its original callback used the incorrect default `http://localhost:3000` and displayed an expired-token error after confirmation.
- September 1, 2026: changed the Auth Site URL to `http://127.0.0.1:5175`, allowed `http://127.0.0.1:5175/**` and `http://localhost:5175/**`, created the browser-safe `signaldesk_web` publishable key and sent a fresh password-recovery email.
- September 1, 2026: connected the local repository to `https://github.com/clubgamerzone/signaldesk` and pushed the complete `main` history. Local `origin/main` now tracks the GitHub branch.
- September 1, 2026: deployed production at `https://signaldeskcrm.netlify.app`, changed the Supabase Auth Site URL to that address and added `https://signaldeskcrm.netlify.app/**` to the redirect allowlist while retaining both local development callbacks.
- September 1, 2026: configured `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` in Netlify, rebuilt successfully and verified that production shows the real Supabase sign-in screen. Three Netlify Functions were deployed.
- Next manual step: sign in at `https://signaldeskcrm.netlify.app` with the owner email and the password created through the recovery flow, then verify workspace access. Do not store that password in this repository.
- September 3, 2026: connected the Leads & pipeline interface to the existing `public.leads`, `workspace_members` and `products` tables. Lead creation and stage changes now persist through Supabase and remain protected by workspace row-level security.
- September 3, 2026: added and applied `202609030001_product_catalog.sql`, the Products & goals interface and bilingual user onboarding. Verification returned the four intended ClubGamerZone products and exactly three product policies: member read access plus owner/admin insert and update access.
- September 3, 2026: replaced the representative Overview CRM values with Supabase-backed opportunity totals, pipeline estimates, stage counts and recent inquiries. Reporting scope and date range now filter the live lead query; traffic and advertising figures remain pending their external connectors.
- September 3, 2026: connected the Account registry to the authenticated `connectors-status` Netlify Function. It checks environment-variable presence for GA4, Google Ads, AdMob, Meta, Firebase, Netlify and OpenAI without returning any secret value.
- September 3, 2026: activated the protected website-inquiry backend. The `202609030002_lead_intake_details.sql` migration was applied and verified with all eight added columns. Netlify now stores the Supabase URL, server-only Supabase secret and shared intake token for SignalDesk; ClubGamerZone stores the matching intake endpoint and token. No secret value is committed to Git.
- September 3, 2026: commit `35aada3` was pushed to the ClubGamerZone `main` branch, but Netlify skipped that production deploy because the team exhausted its deploy credits for the billing cycle. Netlify shows the current free-plan cycle as September 1-30 and the operational credits expiring September 30. The previously published site remains online. The form cannot be tested in Netlify production until deploys resume and Netlify publishes `35aada3` or a later commit.

## 1. Supabase

1. The dedicated Supabase project and initial migration are complete.
2. The first user invitation and `owner` membership are complete.
3. The local `.env` contains the project URL and browser-safe publishable key and remains excluded from Git.
4. Open the newest password-recovery email and create the account password.
5. Sign in locally and verify that the user can access only the `ClubGamerZone` workspace.

The browser receives only the anonymous key. The service-role key is server-only. Row-level security uses `workspace_members` to isolate every record.

The pipeline requires no new database migration. It uses the tables and policies already applied by `202609010001_initial_crm.sql`. Product-specific filtering becomes active as soon as matching product rows exist; unassigned leads remain visible under `All products`.

`supabase/migrations/202609030001_product_catalog.sql` was applied successfully through the Supabase SQL Editor on September 3, 2026. The verification query returned ClubGamerZone website, Organify, CV Enhancer and Games portfolio, plus the expected read, insert and update policies. Future environments should apply this migration once after the initial schema. It can be rerun safely: policies are replaced deliberately and starter products are inserted only when a case-insensitive matching name does not exist.

## 2. Google reporting

Create a Google Cloud project, enable Google Analytics Data API, Google Ads API and AdMob API, then create OAuth web credentials. Authorize only reporting/read scopes and store the refresh token in Netlify environment variables.

Required identifiers:

- GA4 property ID
- Google Ads developer token and customer ID
- Optional Google Ads manager/login customer ID
- AdMob publisher account ID in the `accounts/pub-...` format expected by the API

The Account registry also recognizes the Meta, Firebase and Netlify variables listed in `.env.example`. Add production values only through Netlify environment configuration; never commit them to `.env.example` or source control.

`netlify/functions/sync-google-reporting.ts` refreshes the Google access token server-side and reads the last 30 days from the configured services. It does not edit campaigns, bids, budgets or ad units.

## 3. OpenAI recommendations

Set `OPENAI_API_KEY` and `OPENAI_MODEL` only in Netlify. The browser calls `/api/ai-recommendations` with its Supabase access token. The function validates the user and requests a strict JSON-schema response. It sets `store: false` and instructs the model to use only supplied metrics.

The current UI button sends representative metrics until connector results are normalized and stored in `metric_snapshots`. Do not treat those recommendations as live decisions yet.

## 4. Local commands

```powershell
Copy-Item .env.example .env
npm install
npm run dev
npm run build
```

Vite alone does not execute Netlify Functions. Use Netlify's local development command when testing `/api/*` endpoints after the Netlify CLI and environment variables are configured.

## 5. Website lead intake

1. `supabase/migrations/202609030002_lead_intake_details.sql` has been applied after the product-catalog migration.
2. SignalDesk's protected Netlify environment has `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` and `SIGNALDESK_INTAKE_TOKEN` configured.
3. ClubGamerZone's protected Netlify environment has `SIGNALDESK_INTAKE_URL=https://signaldeskcrm.netlify.app/api/public-lead-intake` and the identical `SIGNALDESK_INTAKE_TOKEN` configured.
4. Never expose the service-role key or shared token through a `VITE_` variable.
5. When Netlify production deploys resume, publish ClubGamerZone commit `35aada3` (or later), submit one consented test inquiry and verify its product, message, contact details and UTM fields in Supabase and SignalDesk.

The browser sends the form only to the ClubGamerZone server function. The shared token is used server-to-server and is never included in the public website bundle.

## Important security boundary

Never add `.env`, OAuth tokens, Supabase service-role keys or the OpenAI API key to Git. Never expose them through `VITE_` variables. Only the Supabase public URL and anonymous key use the `VITE_` prefix.
