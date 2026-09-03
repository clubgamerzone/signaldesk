import { json, requireWorkspaceMember } from './_shared/auth.js';

export default async function handler(request: Request) {
  if (request.method !== 'GET') return json({ error: 'Method not allowed' }, 405);
  const workspaceId = new URL(request.url).searchParams.get('workspace_id');
  if (!workspaceId) return json({ error: 'workspace_id is required' }, 400);
  try { await requireWorkspaceMember(request, workspaceId); } catch (error) { return error instanceof Response ? error : json({ error: 'Unauthorized' }, 401); }
  const status = (provider: string, keys: string[]) => {
    const missing = keys.filter(key => !process.env[key]);
    return { provider, configured: missing.length === 0, missing };
  };
  return json({ checked_at: new Date().toISOString(), connectors: [
    status('ga4', ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'GOOGLE_REFRESH_TOKEN', 'GA4_PROPERTY_ID']),
    status('google_ads', ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'GOOGLE_REFRESH_TOKEN', 'GOOGLE_ADS_DEVELOPER_TOKEN', 'GOOGLE_ADS_CUSTOMER_ID']),
    status('admob', ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'GOOGLE_REFRESH_TOKEN', 'ADMOB_PUBLISHER_ID']),
    status('meta', ['META_ACCESS_TOKEN', 'META_AD_ACCOUNT_ID']),
    status('firebase', ['FIREBASE_PROJECT_ID', 'FIREBASE_CLIENT_EMAIL', 'FIREBASE_PRIVATE_KEY']),
    status('netlify', ['NETLIFY_SITE_ID', 'NETLIFY_AUTH_TOKEN']),
    status('openai', ['OPENAI_API_KEY', 'OPENAI_MODEL']),
    status('lead_intake', ['SUPABASE_SERVICE_ROLE_KEY', 'SIGNALDESK_INTAKE_TOKEN']),
  ] });
}
