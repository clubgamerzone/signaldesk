# SignalDesk implementation guide

## What SignalDesk is

SignalDesk is ClubGamerZone's private marketing CRM and analytics workspace. It is also structured to become a multi-tenant SaaS product, meaning future customers can use the same application while their users, leads, products, integrations and recommendations remain isolated.

## Current status

- The responsive CRM frontend is complete and runs locally.
- English and Spanish modes are available.
- Light and dark themes are available.
- Product scopes include ClubGamerZone, Organify, CV Enhancer and the games portfolio.
- Google Ads and AdMob have distinct acquisition and monetization reporting surfaces.
- AI recommendations include evidence, confidence and human-approval guardrails.
- The dedicated Supabase project is named `signaldesk-crm`.
- The production database migration was applied successfully on September 1, 2026.
- The invitation for `josel.demoya@gmail.com` was sent on September 1, 2026 and is waiting for email verification.
- The invited user is already assigned as `owner` of the `ClubGamerZone` workspace. Database verification returned exactly one matching user, workspace and owner membership.
- Google and OpenAI credentials are not configured yet, so external data and AI output are not live.

## Where everything is

### Application

- `src/App.tsx`: global dashboard, navigation, product/date scopes, language and theme.
- `src/WorkspaceModule.tsx`: leads, companies, campaigns, analytics, AI recommendations, conversations and connections.
- `src/AuthGate.tsx`: Supabase email/password sign-in gate.
- `src/lib/supabase.ts`: browser-safe Supabase client initialization.
- `src/styles.css`: responsive layout, themes, login and module styling.

### Database

- `supabase/migrations/202609010001_initial_crm.sql`: complete first database migration.

The migration creates:

- `workspaces`: each subscribing organization.
- `workspace_members`: users and roles inside each organization.
- `products`: websites, apps, games and services being marketed.
- `leads`: sales inquiries and opportunity stages.
- `integration_connections`: GA4, Google Ads, AdMob, Meta, Netlify, Firebase and OpenAI connection metadata.
- `metric_snapshots`: date-bounded reporting data used for analytics.
- `ai_recommendations`: evidence, confidence, decisions and recommendation status.

Every business table contains `workspace_id`. Row-level security checks `workspace_members` before returning or changing records. The browser's publishable key cannot bypass these policies.

### Server functions

- `netlify/functions/connectors-status.ts`: reports whether required server variables exist.
- `netlify/functions/sync-google-reporting.ts`: retrieves read-only GA4, Google Ads and AdMob reports.
- `netlify/functions/ai-recommendations.ts`: validates the signed-in workspace member and requests structured recommendations.
- `netlify/functions/_shared/auth.ts`: verifies Supabase sessions and workspace membership for server requests.
- `netlify.toml`: builds the Vite app, publishes `dist`, loads functions and maps `/api/*`.

## Security model

1. Supabase Auth confirms who the user is.
2. `workspace_members` determines which organization the user may access.
3. PostgreSQL row-level security enforces the same rule at the database layer.
4. Netlify Functions repeat membership validation before accessing Google or OpenAI.
5. Google reporting is read-only; SignalDesk does not edit campaigns or budgets.
6. AI recommendations require human approval and cannot directly publish or spend money.
7. OAuth tokens and API keys belong only in Netlify environment variables.

Never put passwords, refresh tokens, secret keys or the OpenAI API key into source code, Git, ordinary CRM records, screenshots or chat messages.

## Data and AI flow

1. GA4 supplies website traffic and conversion events.
2. Google Ads supplies acquisition cost, clicks and conversions.
3. AdMob supplies app/game earnings, impressions, eCPM and show-rate data.
4. The connector stores normalized daily snapshots.
5. Deterministic calculations identify changes and anomalies.
6. The AI receives a limited metric summary and returns strict structured recommendations.
7. Jose accepts or rejects each recommendation.
8. SignalDesk measures the result against the original snapshot.

## Activation sequence

1. Accept the Supabase invitation sent to `josel.demoya@gmail.com` and create the account password.
2. Add the project URL and publishable key to local and Netlify configuration.
3. Test sign-in and confirm workspace isolation.
4. Connect GA4 in read-only mode.
5. Connect Google Ads in read-only mode.
6. Connect AdMob reporting.
7. Add the OpenAI server key and model.
8. Replace representative dashboard values with normalized live snapshots.
9. Deploy and verify the dedicated Netlify site.

## Local development

```powershell
cd "D:\React\Marketing app"
npm install
npm run dev
npm run build
```

The local Vite address is normally `http://127.0.0.1:5175/` in the current development session. Vite does not execute Netlify Functions by itself; use Netlify's local development environment after secrets have been configured.

## Related documentation

- `README.md`: concise project summary.
- `BACKEND_SETUP.md`: configuration procedure.
- `C:\Users\jay\Documents\ChatGPT\marketing\AI_MARKETING_COPILOT_SPEC.md`: detailed AI decision-support design.
- `C:\Users\jay\Documents\ChatGPT\marketing\CRM_PRODUCT_SPEC.md`: original CRM/SaaS product specification.
- `C:\Users\jay\Documents\ChatGPT\marketing\MARKETING_PLATFORM_BLUEPRINT.md`: broader marketing architecture.
