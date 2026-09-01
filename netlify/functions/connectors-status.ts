import { json, requireWorkspaceMember } from './_shared/auth.js';

export default async function handler(request: Request) {
  if (request.method !== 'GET') return json({ error: 'Method not allowed' }, 405);
  const workspaceId = new URL(request.url).searchParams.get('workspace_id');
  if (!workspaceId) return json({ error: 'workspace_id is required' }, 400);
  try { await requireWorkspaceMember(request, workspaceId); } catch (error) { return error instanceof Response ? error : json({ error: 'Unauthorized' }, 401); }
  const configured = (keys: string[]) => keys.every(key => Boolean(process.env[key]));
  return json({ connectors: [
    { provider: 'ga4', configured: configured(['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'GOOGLE_REFRESH_TOKEN', 'GA4_PROPERTY_ID']) },
    { provider: 'google_ads', configured: configured(['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'GOOGLE_REFRESH_TOKEN', 'GOOGLE_ADS_DEVELOPER_TOKEN', 'GOOGLE_ADS_CUSTOMER_ID']) },
    { provider: 'admob', configured: configured(['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'GOOGLE_REFRESH_TOKEN', 'ADMOB_PUBLISHER_ID']) },
    { provider: 'openai', configured: configured(['OPENAI_API_KEY', 'OPENAI_MODEL']) },
  ] });
}
