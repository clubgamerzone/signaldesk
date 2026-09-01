create extension if not exists pgcrypto;

create table public.workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default now()
);

create table public.workspace_members (
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('owner', 'admin', 'member', 'viewer')),
  created_at timestamptz not null default now(),
  primary key (workspace_id, user_id)
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null,
  kind text not null check (kind in ('website', 'mobile_app', 'game', 'service', 'other')),
  created_at timestamptz not null default now()
);

create table public.leads (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  name text not null,
  email text,
  company text,
  service text,
  stage text not null default 'new_inquiry',
  source text,
  estimated_value_min numeric,
  estimated_value_max numeric,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.integration_connections (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  product_id uuid references public.products(id) on delete cascade,
  provider text not null check (provider in ('ga4', 'google_ads', 'admob', 'meta', 'netlify', 'firebase', 'openai')),
  external_account_id text,
  status text not null default 'pending',
  scopes text[] not null default '{}',
  last_synced_at timestamptz,
  created_at timestamptz not null default now(),
  unique (workspace_id, product_id, provider, external_account_id)
);

create table public.metric_snapshots (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  product_id uuid references public.products(id) on delete cascade,
  provider text not null,
  period_start date not null,
  period_end date not null,
  metrics jsonb not null,
  created_at timestamptz not null default now()
);

create table public.ai_recommendations (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  product_id uuid references public.products(id) on delete cascade,
  source_snapshot_ids uuid[] not null default '{}',
  title text not null,
  category text not null,
  priority text not null,
  confidence numeric not null check (confidence between 0 and 1),
  evidence jsonb not null,
  suggested_action text not null,
  expected_impact text not null,
  risks jsonb not null default '[]',
  status text not null default 'proposed' check (status in ('proposed', 'accepted', 'rejected', 'completed')),
  decided_by uuid references auth.users(id),
  decided_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.workspaces enable row level security;
alter table public.workspace_members enable row level security;
alter table public.products enable row level security;
alter table public.leads enable row level security;
alter table public.integration_connections enable row level security;
alter table public.metric_snapshots enable row level security;
alter table public.ai_recommendations enable row level security;

create or replace function public.is_workspace_member(target_workspace uuid)
returns boolean language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.workspace_members where workspace_id = target_workspace and user_id = auth.uid()) $$;

create policy "members read workspace" on public.workspaces for select using (public.is_workspace_member(id));
create policy "members read membership" on public.workspace_members for select using (public.is_workspace_member(workspace_id));
create policy "members read products" on public.products for select using (public.is_workspace_member(workspace_id));
create policy "members manage leads" on public.leads for all using (public.is_workspace_member(workspace_id)) with check (public.is_workspace_member(workspace_id));
create policy "members read integrations" on public.integration_connections for select using (public.is_workspace_member(workspace_id));
create policy "members read metrics" on public.metric_snapshots for select using (public.is_workspace_member(workspace_id));
create policy "members read recommendations" on public.ai_recommendations for select using (public.is_workspace_member(workspace_id));
create policy "members decide recommendations" on public.ai_recommendations for update using (public.is_workspace_member(workspace_id)) with check (public.is_workspace_member(workspace_id));

create index products_workspace_idx on public.products(workspace_id);
create index leads_workspace_stage_idx on public.leads(workspace_id, stage);
create index integrations_workspace_provider_idx on public.integration_connections(workspace_id, provider);
create index metrics_workspace_period_idx on public.metric_snapshots(workspace_id, period_start, period_end);
create index recommendations_workspace_status_idx on public.ai_recommendations(workspace_id, status);
