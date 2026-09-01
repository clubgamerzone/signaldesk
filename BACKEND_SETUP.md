# SignalDesk backend setup

The repository contains the production foundation for authentication, workspace isolation, read-only Google reporting and AI recommendations. It remains in demo mode when environment variables are absent.

## Deployment log

- September 1, 2026: created the dedicated `signaldesk-crm` Supabase project in the South America (São Paulo) region.
- September 1, 2026: applied `supabase/migrations/202609010001_initial_crm.sql` successfully through the Supabase SQL Editor.
- September 1, 2026: sent the Supabase invitation to `josel.demoya@gmail.com`; Supabase currently shows `Waiting for verification`.
- September 1, 2026: created the `ClubGamerZone` workspace (`clubgamerzone`) and assigned the invited user the `owner` role. A verification query returned one matching user, one workspace and one owner membership.
- September 1, 2026: the invitation confirmed the user, but its original callback used the incorrect default `http://localhost:3000` and displayed an expired-token error after confirmation.
- September 1, 2026: changed the Auth Site URL to `http://127.0.0.1:5175`, allowed `http://127.0.0.1:5175/**` and `http://localhost:5175/**`, created the browser-safe `signaldesk_web` publishable key and sent a fresh password-recovery email.
- Next manual step: open the newest Supabase recovery email and choose a password on SignalDesk's password-setup screen. Do not store that password in this repository.

## 1. Supabase

1. The dedicated Supabase project and initial migration are complete.
2. The first user invitation and `owner` membership are complete.
3. The local `.env` contains the project URL and browser-safe publishable key and remains excluded from Git.
4. Open the newest password-recovery email and create the account password.
5. Sign in locally and verify that the user can access only the `ClubGamerZone` workspace.

The browser receives only the anonymous key. The service-role key is server-only. Row-level security uses `workspace_members` to isolate every record.

## 2. Google reporting

Create a Google Cloud project, enable Google Analytics Data API, Google Ads API and AdMob API, then create OAuth web credentials. Authorize only reporting/read scopes and store the refresh token in Netlify environment variables.

Required identifiers:

- GA4 property ID
- Google Ads developer token and customer ID
- Optional Google Ads manager/login customer ID
- AdMob publisher account ID in the `accounts/pub-...` format expected by the API

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

## Important security boundary

Never add `.env`, OAuth tokens, Supabase service-role keys or the OpenAI API key to Git. Never expose them through `VITE_` variables. Only the Supabase public URL and anonymous key use the `VITE_` prefix.
