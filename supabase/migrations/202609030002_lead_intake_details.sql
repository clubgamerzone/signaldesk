alter table public.leads
  add column if not exists phone text,
  add column if not exists message text,
  add column if not exists locale text check (locale is null or locale in ('en', 'es')),
  add column if not exists page_url text,
  add column if not exists utm_source text,
  add column if not exists utm_medium text,
  add column if not exists utm_campaign text,
  add column if not exists consent_at timestamptz;

create index if not exists leads_workspace_created_idx
  on public.leads(workspace_id, created_at desc);
