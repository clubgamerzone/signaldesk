import { timingSafeEqual } from 'node:crypto';
import { json } from './_shared/auth.js';

type IntakePayload = {
  workspace?: string;
  product?: string;
  name?: string;
  email?: string;
  phone?: string;
  project_type?: string;
  message?: string;
  locale?: string;
  page_url?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  consent?: boolean;
  loaded_at?: number;
  bot_field?: string;
};

const allowedProjectTypes = new Set(['Software or app', 'Website or platform', 'AI integration or automation', 'Video game or interactive', 'Other']);
const clean = (value: unknown, maximum: number) => typeof value === 'string' ? value.trim().slice(0, maximum) : '';

function tokenMatches(received: string, expected: string) {
  const receivedBytes = Buffer.from(received);
  const expectedBytes = Buffer.from(expected);
  return receivedBytes.length === expectedBytes.length && timingSafeEqual(receivedBytes, expectedBytes);
}

async function rest(path: string, options: RequestInit = {}) {
  const url = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) throw new Error('CRM database configuration is incomplete.');
  return fetch(`${url}/rest/v1/${path}`, { ...options, headers: { authorization: `Bearer ${serviceKey}`, apikey: serviceKey, 'content-type': 'application/json', ...options.headers } });
}

export default async function handler(request: Request) {
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
  const expectedToken = process.env.SIGNALDESK_INTAKE_TOKEN;
  const receivedToken = request.headers.get('x-signaldesk-intake-token') || '';
  if (!expectedToken || !tokenMatches(receivedToken, expectedToken)) return json({ error: 'Unauthorized' }, 401);

  try {
    const payload = await request.json() as IntakePayload;
    if (clean(payload.bot_field, 100)) return json({ accepted: true }, 202);
    const now = Date.now();
    if (!payload.loaded_at || now - payload.loaded_at < 2000 || now - payload.loaded_at > 86_400_000) return json({ error: 'Invalid form timing' }, 400);

    const workspaceSlug = clean(payload.workspace, 80);
    const productName = clean(payload.product, 120);
    const name = clean(payload.name, 120);
    const email = clean(payload.email, 254).toLowerCase();
    const phone = clean(payload.phone, 40);
    const projectType = clean(payload.project_type, 120);
    const message = clean(payload.message, 3000);
    const locale = payload.locale === 'es' ? 'es' : 'en';
    if (!workspaceSlug || !productName || !name || !email || !message || !payload.consent) return json({ error: 'Required inquiry fields are missing' }, 400);
    if (!/^\S+@\S+\.\S+$/.test(email)) return json({ error: 'A valid email is required' }, 400);
    if (!allowedProjectTypes.has(projectType)) return json({ error: 'Invalid project type' }, 400);

    const workspaceQuery = new URLSearchParams({ slug: `eq.${workspaceSlug}`, select: 'id', limit: '1' });
    const workspaceResponse = await rest(`workspaces?${workspaceQuery}`);
    const workspaces = await workspaceResponse.json() as Array<{ id: string }>;
    if (!workspaceResponse.ok || !workspaces[0]) return json({ error: 'Workspace not found' }, 404);

    const productQuery = new URLSearchParams({ workspace_id: `eq.${workspaces[0].id}`, name: `ilike.${productName}`, select: 'id', limit: '1' });
    const productResponse = await rest(`products?${productQuery}`);
    const products = await productResponse.json() as Array<{ id: string }>;
    if (!productResponse.ok || !products[0]) return json({ error: 'Product not found' }, 404);

    const leadResponse = await rest('leads', { method: 'POST', headers: { Prefer: 'return=representation' }, body: JSON.stringify({
      workspace_id: workspaces[0].id,
      product_id: products[0].id,
      name,
      email,
      phone: phone || null,
      service: projectType,
      message,
      locale,
      page_url: clean(payload.page_url, 500) || null,
      utm_source: clean(payload.utm_source, 120) || null,
      utm_medium: clean(payload.utm_medium, 120) || null,
      utm_campaign: clean(payload.utm_campaign, 160) || null,
      consent_at: new Date().toISOString(),
      stage: 'new_inquiry',
      source: 'Website form',
      created_by: null,
    }) });
    if (!leadResponse.ok) {
      console.error('Lead intake insert failed:', leadResponse.status, await leadResponse.text());
      return json({ error: 'The inquiry could not be saved' }, 502);
    }
    const leads = await leadResponse.json() as Array<{ id: string }>;
    return json({ accepted: true, lead_id: leads[0]?.id }, 201);
  } catch (error) {
    console.error('Public lead intake failed:', error instanceof Error ? error.message : 'Unknown error');
    return json({ error: 'The inquiry could not be saved' }, 500);
  }
}
