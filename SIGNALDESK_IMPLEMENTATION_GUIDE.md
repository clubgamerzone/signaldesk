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
- The Supabase user `josel.demoya@gmail.com` is confirmed and assigned as the workspace owner.
- The invited user is already assigned as `owner` of the `ClubGamerZone` workspace. Database verification returned exactly one matching user, workspace and owner membership.
- The local Supabase browser configuration is active, the allowed local callbacks use port `5175`, and a fresh password-recovery email was sent after correcting the original `localhost:3000` callback.
- The source repository is `https://github.com/clubgamerzone/signaldesk`; branch `main` is pushed and ready to import into Netlify.
- Production is live at `https://signaldeskcrm.netlify.app` with Supabase authentication enabled. Netlify has the two public Supabase build variables and the production callback is registered in Supabase.
- Google and OpenAI credentials are not configured yet, so external data and AI output are not live.
- The Leads & pipeline module now loads real records from Supabase, creates persistent leads and saves stage changes. It uses representative records only when Supabase is not configured and labels that mode clearly.

## Where everything is

### Application

- `src/App.tsx`: global dashboard, navigation, product/date scopes, language and theme.
- `src/WorkspaceModule.tsx`: leads, companies, campaigns, analytics, AI recommendations, conversations and connections.
- `src/AuthGate.tsx`: Supabase email/password sign-in gate plus the secure password-setup screen used by recovery links.
- `src/lib/supabase.ts`: browser-safe Supabase client initialization.
- `src/hooks/useWorkspaceLeads.ts`: workspace membership lookup, product-aware lead loading, persistent creation and optimistic stage updates.
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

## Live lead workflow

1. `AuthGate.tsx` confirms the user has a valid Supabase session.
2. `useWorkspaceLeads.ts` reads the user's first authorized `workspace_members` record; row-level security remains the final authorization boundary.
3. When the reporting scope names a configured product, the hook resolves its database ID and filters the pipeline by `product_id`. `All products` reads the complete workspace pipeline.
4. The lead form writes name, email, company, service, source, USD value range, workspace, optional product and creator to `public.leads`.
5. Every new record starts at `new_inquiry`. The stage selector persists transitions through discovery, qualification, proposal, won or lost.
6. A failed stage update rolls the interface back to the last confirmed database state and shows an actionable error.

Product-specific lead assignment requires matching rows in `public.products`. Until those rows are created, use `All products`; newly entered records will be safely stored as unassigned rather than linked to an invented product.

## Activation sequence

1. Open the newest Supabase password-recovery email and create the account password on the local SignalDesk screen.
2. Test sign-in and confirm workspace isolation.
3. Add the project URL and publishable key to Netlify configuration before deployment.
4. Connect GA4 in read-only mode.
5. Connect Google Ads in read-only mode.
6. Connect AdMob reporting.
7. Add the OpenAI server key and model.
8. Create the product registry rows for ClubGamerZone website, Organify, CV Enhancer and the games portfolio.
9. Replace representative dashboard values with normalized live snapshots.
10. Deploy and verify the dedicated Netlify site.

## GitHub and Netlify deployment

- GitHub repository: `https://github.com/clubgamerzone/signaldesk`
- Production site: `https://signaldeskcrm.netlify.app`
- Production branch: `main`
- Netlify build command: `npm run build`
- Netlify publish directory: `dist`
- Netlify Functions directory: `netlify/functions`

After Netlify creates the site, copy its production URL into Supabase Authentication as the Site URL and add `https://<netlify-site>/**` to Redirect URLs. Then add `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` to Netlify's environment variables. Server-only keys must never use the `VITE_` prefix.

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
