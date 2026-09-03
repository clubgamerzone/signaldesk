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
- The Products & goals module reads the live workspace catalog and permits owners/admins to create or rename reporting scopes. The product-catalog migration was applied and verified on September 3, 2026.
- The Overview now calculates opportunity count, estimated open-pipeline value, qualified progression, won count, stage funnel and recent inquiries from Supabase. Product and date selectors filter those queries; zero means no matching real records rather than missing demo data.
- A bilingual Guide & onboarding module and `docs/USER_GUIDE.md` explain the SaaS purpose, daily workflow, modules, roles, data-status indicators, safety rules and product roadmap.

## Where everything is

### Application

- `src/App.tsx`: global dashboard, navigation, product/date scopes, language and theme.
- `src/WorkspaceModule.tsx`: leads, companies, campaigns, analytics, AI recommendations, conversations and connections.
- `src/AuthGate.tsx`: Supabase email/password sign-in gate plus the secure password-setup screen used by recovery links.
- `src/lib/supabase.ts`: browser-safe Supabase client initialization.
- `src/hooks/useWorkspaceLeads.ts`: workspace membership lookup, product-aware lead loading, persistent creation and optimistic stage updates.
- `src/hooks/useWorkspaceProducts.ts`: product-catalog loading plus owner/admin create and update operations.
- `src/ProductCatalog.tsx`: catalog cards, product editor and permission/error states.
- `src/UserGuide.tsx`: bilingual in-app onboarding and module guidance.
- `src/OverviewDashboard.tsx`: live CRM summary, funnel, recent activity, pipeline snapshot and connector boundaries.
- `src/hooks/useWorkspaceOverview.ts`: workspace-authorized overview query with product and date filtering.
- `src/styles.css`: responsive layout, themes, login and module styling.

### Database

- `supabase/migrations/202609010001_initial_crm.sql`: complete first database migration.
- `supabase/migrations/202609030001_product_catalog.sql`: owner/admin catalog permissions and idempotent ClubGamerZone starter products.

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

## Live overview workflow

1. `useWorkspaceOverview.ts` resolves the signed-in user's authorized workspace through row-level security.
2. The reporting scope resolves a product name to its database ID; **All products** omits the product filter.
3. The date selector filters leads by `created_at`. It does not claim that a stage transition happened during that period.
4. Open-pipeline value uses the midpoint of a lead's minimum and maximum estimate, or the available boundary when only one exists.
5. Qualified progression counts records at qualified, proposal or won stages divided by all matching records.
6. Traffic, ad spend and monetization remain pending until GA4, Google Ads and AdMob are connected.

Product-specific lead assignment requires matching rows in `public.products`. Until those rows are created, use `All products`; newly entered records will be safely stored as unassigned rather than linked to an invented product.

## Product catalog workflow

1. `202609030001_product_catalog.sql` was applied after the initial schema on September 3, 2026.
2. The migration adds a `can_manage_workspace` authorization helper and limits product creation/updates to owners and administrators.
3. It idempotently creates the four ClubGamerZone starter scopes without duplicating matching records.
4. Members and viewers retain read access through the existing policy.
5. Product deletion is intentionally excluded because leads, metrics, recommendations and integrations may reference a product. A future archive workflow should replace destructive deletion.

## Activation sequence

Completed foundation:

1. Supabase authentication, workspace isolation and owner membership are configured.
2. The project URL and publishable key are configured in Netlify.
3. The dedicated Netlify site is deployed and its authentication callback is registered.
4. The product catalog migration is applied and the four initial reporting scopes are live.

Remaining integrations:

1. Connect GA4 in read-only mode.
2. Connect Google Ads in read-only mode.
3. Connect AdMob reporting.
4. Add the OpenAI server key and model.
5. Ingest ClubGamerZone contact-form and assistant inquiries as leads.
6. Replace representative dashboard values with normalized live snapshots.
7. Run an end-to-end production test covering sign-in, lead capture, attribution, reporting and AI recommendations.

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
- `docs/USER_GUIDE.md`: bilingual user-facing purpose, onboarding, workflows, roles and roadmap.
- `docs/README.md`: documentation index and update rules.
- `BACKEND_SETUP.md`: configuration procedure.
- `C:\Users\jay\Documents\ChatGPT\marketing\AI_MARKETING_COPILOT_SPEC.md`: detailed AI decision-support design.
- `C:\Users\jay\Documents\ChatGPT\marketing\CRM_PRODUCT_SPEC.md`: original CRM/SaaS product specification.
- `C:\Users\jay\Documents\ChatGPT\marketing\MARKETING_PLATFORM_BLUEPRINT.md`: broader marketing architecture.
