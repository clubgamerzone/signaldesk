import { json, requireWorkspaceMember } from './_shared/auth.js';

async function accessToken() {
  const body = new URLSearchParams({ client_id: process.env.GOOGLE_CLIENT_ID!, client_secret: process.env.GOOGLE_CLIENT_SECRET!, refresh_token: process.env.GOOGLE_REFRESH_TOKEN!, grant_type: 'refresh_token' });
  const response = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' }, body });
  if (!response.ok) throw new Error(`Google OAuth refresh failed (${response.status})`);
  return ((await response.json()) as { access_token: string }).access_token;
}

async function googleJson(url: string, token: string, body: unknown, extraHeaders: Record<string, string> = {}) {
  const response = await fetch(url, { method: 'POST', headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json', ...extraHeaders }, body: JSON.stringify(body) });
  if (!response.ok) throw new Error(`${url} failed (${response.status})`);
  return response.json();
}

export default async function handler(request: Request) {
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
  try {
    const payload = await request.json() as { workspace_id?: string };
    if (!payload.workspace_id) return json({ error: 'workspace_id is required' }, 400);
    await requireWorkspaceMember(request, payload.workspace_id);
    const required = ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'GOOGLE_REFRESH_TOKEN'];
    if (!required.every(key => process.env[key])) return json({ error: 'Google OAuth is not configured' }, 503);
    const token = await accessToken();
    const results: Record<string, unknown> = {};
    if (process.env.GA4_PROPERTY_ID) results.ga4 = await googleJson(`https://analyticsdata.googleapis.com/v1beta/properties/${process.env.GA4_PROPERTY_ID}:runReport`, token, { dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }], dimensions: [{ name: 'sessionSourceMedium' }], metrics: [{ name: 'sessions' }, { name: 'conversions' }] });
    if (process.env.ADMOB_PUBLISHER_ID) results.admob = await googleJson(`https://admob.googleapis.com/v1/accounts/${process.env.ADMOB_PUBLISHER_ID}/networkReport:generate`, token, { reportSpec: { dateRange: { startDate: dateParts(-30), endDate: dateParts(0) }, dimensions: ['APP'], metrics: ['ESTIMATED_EARNINGS', 'IMPRESSIONS', 'IMPRESSION_CTR', 'SHOW_RATE'] } });
    if (process.env.GOOGLE_ADS_CUSTOMER_ID && process.env.GOOGLE_ADS_DEVELOPER_TOKEN) results.google_ads = await googleJson(`https://googleads.googleapis.com/v23/customers/${process.env.GOOGLE_ADS_CUSTOMER_ID.replaceAll('-', '')}/googleAds:searchStream`, token, { query: 'SELECT campaign.id, campaign.name, metrics.cost_micros, metrics.clicks, metrics.conversions FROM campaign WHERE segments.date DURING LAST_30_DAYS' }, { 'developer-token': process.env.GOOGLE_ADS_DEVELOPER_TOKEN, ...(process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID ? { 'login-customer-id': process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID.replaceAll('-', '') } : {}) });
    return json({ workspace_id: payload.workspace_id, generated_at: new Date().toISOString(), read_only: true, results });
  } catch (error) { return error instanceof Response ? error : json({ error: error instanceof Error ? error.message : 'Sync failed' }, 500); }
}

function dateParts(offsetDays: number) { const date = new Date(); date.setUTCDate(date.getUTCDate() + offsetDays); return { year: date.getUTCFullYear(), month: date.getUTCMonth() + 1, day: date.getUTCDate() }; }
