# SignalDesk — ClubGamerZone Marketing CRM

Standalone CRM and marketing operations dashboard for ClubGamerZone, designed to become a multi-tenant SaaS product.

## Current milestone

This first slice is a polished, responsive dashboard shell using clearly labelled representative demo data. It does **not** currently read live metrics from clubgamerzone.com, Google Analytics, Firebase, Meta or advertising accounts. The reporting-scope selector now switches between the workspace and its products (website, Organify, CV Enhancer and Games portfolio), with product-specific placeholder metrics. This keeps the product model honest while the connection layer is built.

## Current implementation notes

- `src/App.tsx` contains the initial workspace shell, navigation, product scope selector and demo metric map (`productStats`).
- `src/WorkspaceModule.tsx` contains the usable frontend modules for leads, companies, campaigns, analytics, conversations and the account registry. It also owns the local lead-entry dialog and module search behavior.
- `src/styles.css` contains the responsive layout plus the demo-workspace banner and scope selector styles.
- The **Account registry** is currently a visual connection-health mock. Replace its statuses only after OAuth/API credentials are configured through environment secrets.
- Live ingestion still requires authenticated connections for GA4, Netlify, Firebase, Meta/Google Ads and the website/app event SDKs. Do not paste tokens into source files or CRM records.

## Implemented frontend behavior

- Workspace and individual-product reporting scopes.
- Selectable date ranges and a consistent responsive dashboard shell.
- Searchable opportunity table and local add-lead confirmation flow.
- Company, campaign, analytics, conversation and connection-registry views.
- Honest pending states for every external integration.
- Separate Google Ads acquisition reporting (spend, clicks, conversions and qualified-lead cost) from Google AdMob monetization reporting (revenue, impressions, eCPM and fill rate).
- AI recommendations workspace with evidence, confidence, a proposed action and an explicit human-approval guardrail. Its current cards are representative until the analytics connectors and server-side AI endpoint are live.
- Persistent light/dark theme stored in browser preferences.
- Persistent English/Spanish interface switcher with country flags; navigation, overview metrics, funnel, activity, connection states and primary module controls are translated.

The records and calculations remain representative UI data. Refreshing the browser resets lead-form entries because durable database persistence is intentionally deferred until authentication and workspace isolation are implemented.

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

## Product reporting model

ClubGamerZone is the first workspace. Its products and properties will be separate reporting entities inside that workspace, for example:

- ClubGamerZone marketing website
- Organify
- CV Enhancer / Currículo Claro
- Games such as Hell Cemetery, Instruments of Faith and others
- Future products or client workspaces

Each entity gets its own analytics properties, event dictionary, campaigns and connection records. The dashboard can then show each product independently or aggregate the workspace into one view. The current Overview numbers are placeholders until those live connections and event pipelines are implemented.

Never store passwords, API keys, OAuth tokens, verification codes or raw exports in ordinary CRM records.
