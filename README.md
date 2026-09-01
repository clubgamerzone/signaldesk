# SignalDesk — ClubGamerZone Marketing CRM

Standalone CRM and marketing operations dashboard for ClubGamerZone, designed to become a multi-tenant SaaS product.

## Current milestone

This first slice is a polished, responsive dashboard shell using representative data. It demonstrates the product direction: workspace switching, navigation, pipeline, lead activity, funnel reporting and an account/integration registry. Data persistence, authentication and external account connections are intentionally not faked yet.

## Product direction

ClubGamerZone is the first workspace (dogfooding). The data model should keep `workspace_id` on every business record so a future customer can have a fully isolated organization, users, roles, data and integrations.

The CRM has its own repository, Netlify project, database, authentication and secrets. It is separate from `clubgamerzonewebapp`.

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

## Planned modules

- Leads, companies, contacts and opportunities
- Pipeline stages, activities, tasks and proposals
- Campaigns and first/last-touch attribution
- Website, app and game event ingestion
- Account registry for GA4, Firebase, Google Ads, Meta, GitHub, Netlify and WhatsApp
- AI conversation summaries with consent and retention controls
- Role-based access, workspace isolation and audit log
- BigQuery analytics plus PostgreSQL operational CRM records

Never store passwords, API keys, OAuth tokens, verification codes or raw exports in ordinary CRM records.
