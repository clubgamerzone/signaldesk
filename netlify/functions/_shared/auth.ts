type AuthenticatedUser = { id: string; email?: string };

export async function requireUser(request: Request): Promise<AuthenticatedUser> {
  const authorization = request.headers.get('authorization');
  const url = process.env.SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY;
  if (!authorization?.startsWith('Bearer ') || !url || !anonKey) throw new Response('Unauthorized', { status: 401 });
  const response = await fetch(`${url}/auth/v1/user`, { headers: { authorization, apikey: anonKey } });
  if (!response.ok) throw new Response('Unauthorized', { status: 401 });
  return response.json() as Promise<AuthenticatedUser>;
}

export async function requireWorkspaceMember(request: Request, workspaceId: string) {
  const user = await requireUser(request);
  const authorization = request.headers.get('authorization')!;
  const url = process.env.SUPABASE_URL!;
  const anonKey = process.env.SUPABASE_ANON_KEY!;
  const query = new URLSearchParams({ workspace_id: `eq.${workspaceId}`, user_id: `eq.${user.id}`, select: 'workspace_id', limit: '1' });
  const response = await fetch(`${url}/rest/v1/workspace_members?${query}`, { headers: { authorization, apikey: anonKey } });
  if (!response.ok) throw new Response('Authorization check failed', { status: 502 });
  const rows = await response.json() as Array<{ workspace_id: string }>;
  if (!rows.length) throw new Response('Forbidden', { status: 403 });
  return user;
}

export function json(value: unknown, status = 200) {
  return new Response(JSON.stringify(value), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });
}
