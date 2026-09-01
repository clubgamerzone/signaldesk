# SignalDesk backend setup

The repository contains the production foundation for authentication, workspace isolation, read-only Google reporting and AI recommendations. It remains in demo mode when environment variables are absent.

## 1. Supabase

1. Create a dedicated Supabase project for SignalDesk.
2. Run `supabase/migrations/202609010001_initial_crm.sql` in the SQL editor or Supabase CLI.
3. Create the initial user through Supabase Authentication.
4. Insert a `workspaces` row and a matching `workspace_members` row with that user's UUID and the `owner` role.
5. Add the Supabase URL and keys from `.env.example` to local `.env` and Netlify environment variables.

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
