# SignalDesk — ClubGamerZone Marketing CRM

Standalone CRM and marketing operations dashboard for ClubGamerZone, designed to become a multi-tenant SaaS product.

## Current milestone

SignalDesk now reads its product catalog, leads, pipeline totals, stage funnel and recent inquiries from the private Supabase workspace. It does **not** yet read traffic or advertising metrics from clubgamerzone.com, Google Analytics, Firebase, Meta or advertising accounts. Those surfaces remain clearly labelled as representative or pending until their connectors are configured.

## Current implementation notes

- `src/App.tsx` contains the workspace shell, navigation and the live product scope selector.
- `src/OverviewDashboard.tsx` renders the Supabase-backed CRM summary, funnel, recent inquiries and pipeline snapshot.
- `src/hooks/useWorkspaceOverview.ts` applies product and date filters when loading the live overview.
- `src/WorkspaceModule.tsx` contains the usable frontend modules for leads, companies, campaigns, analytics, conversations and the account registry. It also owns the local lead-entry dialog and module search behavior.
- `src/styles.css` contains the responsive layout plus the demo-workspace banner and scope selector styles.
- The **Account registry** is currently a visual connection-health mock. Replace its statuses only after OAuth/API credentials are configured through environment secrets.
- Live ingestion still requires authenticated connections for GA4, Netlify, Firebase, Meta/Google Ads and the website/app event SDKs. Do not paste tokens into source files or CRM records.

## Implemented frontend behavior

- Workspace and individual-product reporting scopes.
- Selectable date ranges and a consistent responsive dashboard shell.
- Supabase-backed overview totals, opportunity funnel, recent inquiries and pipeline snapshot.
- Supabase-backed opportunity table with persistent lead creation, product scoping and inline pipeline-stage updates.
- Company, campaign, analytics, conversation and connection-registry views.
- Owner/admin product catalog for separating websites, applications, games and SaaS offerings.
- Bilingual in-app Guide & onboarding center covering goals, daily workflow, modules and data safety.
- Honest pending states for every external integration.
- Separate Google Ads acquisition reporting (spend, clicks, conversions and qualified-lead cost) from Google AdMob monetization reporting (revenue, impressions, eCPM and fill rate).
- AI recommendations workspace with evidence, confidence, a proposed action and an explicit human-approval guardrail. Its current cards are representative until the analytics connectors and server-side AI endpoint are live.
- Persistent light/dark theme stored in browser preferences.
- Persistent English/Spanish interface switcher with country flags; navigation, overview metrics, funnel, activity, connection states and primary module controls are translated.

Company, campaign, conversation and external analytics values remain representative until their connector or database modules are activated. When Supabase is configured and the user is signed in, the Overview and Leads & pipeline modules read real workspace records. Without Supabase, they remain in a clearly labelled read-only demo mode.

## Product direction

ClubGamerZone is the first workspace (dogfooding). The data model should keep `workspace_id` on every business record so a future customer can have a fully isolated organization, users, roles, data and integrations.

The CRM is designed for its own repository, Netlify project, Supabase/PostgreSQL database, authentication and secrets. It is separate from `clubgamerzonewebapp`.

## Run locally

Requires Node.js 22 or newer.

```powershell
npm install
npm run dev
```

Then open the local URL printed by Vite.

```powershell
npm run build
npm run preview
```

Without environment variables, the dashboard intentionally runs in demo mode. Configure `.env.example` to activate authentication and server integrations. See `BACKEND_SETUP.md` for the exact sequence.

## Backend foundation

- Supabase authentication gate.
- Multi-tenant PostgreSQL schema with `workspace_id` ownership and row-level security.
- Authenticated Netlify Functions for connection readiness, read-only Google reporting and AI recommendations.
- OpenAI Responses API output constrained by a strict recommendation JSON schema.

## Planned modules

- Leads, companies, contacts and opportunities
- Pipeline stages, activities, tasks and proposals
- Campaigns and first/last-touch attribution
- Website, app and game event ingestion
- Account registry for GA4, Firebase, Google Ads, Meta, GitHub, Netlify and WhatsApp
- AI conversation summaries with consent and retention controls
- Role-based access, workspace isolation and audit log
- BigQuery analytics plus PostgreSQL operational CRM records

## User documentation

- Open **Guide & onboarding / Guía y configuración** inside SignalDesk for the operational introduction.
- Read `docs/USER_GUIDE.md` for the complete bilingual onboarding, workflow, roles and roadmap reference.
- Read `SIGNALDESK_IMPLEMENTATION_GUIDE.md` for architecture and maintenance details.

## Product reporting model

ClubGamerZone is the first workspace. Its products and properties will be separate reporting entities inside that workspace, for example:

- ClubGamerZone marketing website
- Organify
- CV Enhancer / Currículo Claro
- Games such as Hell Cemetery, Instruments of Faith and others
- Future products or client workspaces

Each entity gets its own analytics properties, event dictionary, campaigns and connection records. The dashboard can show each product independently or aggregate the workspace into one view. CRM opportunity numbers are live; traffic, advertising and monetization numbers require their external connectors.

Never store passwords, API keys, OAuth tokens, verification codes or raw exports in ordinary CRM records.
