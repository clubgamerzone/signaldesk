create or replace function public.can_manage_workspace(target_workspace uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.workspace_members
    where workspace_id = target_workspace
      and user_id = auth.uid()
      and role in ('owner', 'admin')
  )
$$;

revoke all on function public.can_manage_workspace(uuid) from public;
grant execute on function public.can_manage_workspace(uuid) to authenticated;

drop policy if exists "workspace admins insert products" on public.products;
create policy "workspace admins insert products"
on public.products for insert
to authenticated
with check (public.can_manage_workspace(workspace_id));

drop policy if exists "workspace admins update products" on public.products;
create policy "workspace admins update products"
on public.products for update
to authenticated
using (public.can_manage_workspace(workspace_id))
with check (public.can_manage_workspace(workspace_id));

insert into public.products (workspace_id, name, kind)
select workspace.id, seed.name, seed.kind
from public.workspaces as workspace
cross join (
  values
    ('ClubGamerZone website', 'website'),
    ('Organify', 'mobile_app'),
    ('CV Enhancer', 'service'),
    ('Games portfolio', 'game')
) as seed(name, kind)
where workspace.slug = 'clubgamerzone'
  and not exists (
    select 1
    from public.products existing
    where existing.workspace_id = workspace.id
      and lower(existing.name) = lower(seed.name)
  );
