import { useEffect, useMemo, useState } from 'react';
import {
  ArrowUpRight, BadgeDollarSign, BarChart3, Bot, Building2, CheckCircle2,
  CircleDollarSign, Database, Filter, Globe2, Inbox, LoaderCircle, RefreshCw, Smartphone,
  MoreHorizontal, Plus, Search, Target, X,
} from 'lucide-react';
import { supabase } from './lib/supabase';
import { useConnectorStatus } from './hooks/useConnectorStatus';
import { type LeadDraft, type LeadStage, useWorkspaceLeads } from './hooks/useWorkspaceLeads';
import ProductCatalog from './ProductCatalog';
import UserGuide from './UserGuide';

type ModuleProps = { active: string; product: string; productKey: string; language: 'en' | 'es'; openLeadFormSignal?: number; onNavigate: (module: string) => void };
type GeneratedInsight = { title: string; priority: string; confidence: number; evidence: Array<{ metric: string; value: string; comparison: string }>; suggested_action: string; expected_impact: string; risks: string[] };
type Opportunity = { id?: string; name: string; email?: string | null; company: string; service: string; stage: string; stageKey: LeadStage; value: string; source: string };

const demoOpportunities: Opportunity[] = [
  { name: 'Mariana Rojas', company: 'Northstar Health', service: 'AI automation', stage: 'Qualified', stageKey: 'qualified', value: '$18k–$25k', source: 'AI assistant' },
  { name: 'Daniel López', company: 'Lumen Foods', service: 'Mobile product', stage: 'Discovery', stageKey: 'discovery', value: '$12k–$18k', source: 'Referral' },
  { name: 'Sofia Alvarez', company: 'Independent', service: 'Web platform', stage: 'New inquiry', stageKey: 'new_inquiry', value: '$8k–$12k', source: 'Website form' },
  { name: 'James Turner', company: 'Redwood Labs', service: 'Custom software', stage: 'Proposal', stageKey: 'proposal', value: '$25k+', source: 'LinkedIn' },
];

const stageOrder: LeadStage[] = ['new_inquiry', 'discovery', 'qualified', 'proposal', 'won', 'lost'];

function formatLeadValue(minimum: number | null, maximum: number | null) {
  const money = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0, notation: value >= 1000 ? 'compact' : 'standard' }).format(value);
  if (minimum !== null && maximum !== null) return `${money(minimum)}–${money(maximum)}`;
  if (minimum !== null) return `${money(minimum)}+`;
  if (maximum !== null) return `Up to ${money(maximum)}`;
  return '—';
}

const companies = [
  { name: 'Northstar Health', contact: 'Mariana Rojas', projects: 2, value: '$25k', status: 'Active' },
  { name: 'Lumen Foods', contact: 'Daniel López', projects: 1, value: '$18k', status: 'Prospect' },
  { name: 'Redwood Labs', contact: 'James Turner', projects: 1, value: '$25k+', status: 'Proposal' },
  { name: 'Veolia', contact: 'Private client', projects: 1, value: 'Private', status: 'Delivered' },
];

const campaigns = [
  { name: 'AI Automation Leads', channel: 'Meta Ads', product: 'ClubGamerZone website', spend: '$860', leads: 14, cpl: '$61.43', status: 'Active' },
  { name: 'CV Enhancer Launch', channel: 'Google Ads', product: 'CV Enhancer', spend: '$420', leads: 8, cpl: '$52.50', status: 'Draft' },
  { name: 'Organify Early Access', channel: 'Organic', product: 'Organify', spend: '$0', leads: 21, cpl: '$0', status: 'Active' },
  { name: 'Mobile & Game Monetization', channel: 'Google AdMob', product: 'Apps & games', spend: '—', leads: 0, cpl: 'Revenue', status: 'Needs setup' },
];

const connections = [
  { provider: 'ga4', name: 'Google Analytics 4', owner: 'ClubGamerZone website', icon: BarChart3, detail: 'Visits, acquisition and conversions' },
  { provider: 'netlify', name: 'Netlify', owner: 'ClubGamerZone website', icon: Globe2, detail: 'Deployments, forms and serverless events' },
  { provider: 'meta', name: 'Meta Business', owner: 'Marketing workspace', icon: Target, detail: 'Campaigns, spend and lead attribution' },
  { provider: 'google_ads', name: 'Google Ads', owner: 'Marketing workspace', icon: CircleDollarSign, detail: 'Search campaigns and conversion costs' },
  { provider: 'admob', name: 'Google AdMob', owner: 'Apps & games portfolio', icon: Smartphone, detail: 'Ad revenue, impressions, eCPM and fill rate' },
  { provider: 'firebase', name: 'Firebase', owner: 'Organify / apps', icon: Database, detail: 'App events and audience activity' },
  { provider: 'openai', name: 'AI assistant', owner: 'ClubGamerZone website', icon: Bot, detail: 'Qualified conversations and summaries' },
];

const connectorVariables: Record<string, string[]> = {
  ga4: ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'GOOGLE_REFRESH_TOKEN', 'GA4_PROPERTY_ID'],
  netlify: ['NETLIFY_SITE_ID', 'NETLIFY_AUTH_TOKEN'],
  meta: ['META_ACCESS_TOKEN', 'META_AD_ACCOUNT_ID'],
  google_ads: ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'GOOGLE_REFRESH_TOKEN', 'GOOGLE_ADS_DEVELOPER_TOKEN', 'GOOGLE_ADS_CUSTOMER_ID'],
  admob: ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'GOOGLE_REFRESH_TOKEN', 'ADMOB_PUBLISHER_ID'],
  firebase: ['FIREBASE_PROJECT_ID', 'FIREBASE_CLIENT_EMAIL', 'FIREBASE_PRIVATE_KEY'],
  openai: ['OPENAI_API_KEY', 'OPENAI_MODEL'],
};

export default function WorkspaceModule({ active, product, productKey, language, openLeadFormSignal = 0, onNavigate }: ModuleProps) {
  const [query, setQuery] = useState('');
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [saved, setSaved] = useState(false);
  const [savingLead, setSavingLead] = useState(false);
  const [leadFormError, setLeadFormError] = useState('');
  const [leadActionError, setLeadActionError] = useState('');
  const [generating, setGenerating] = useState(false);
  const [aiError, setAiError] = useState('');
  const [generatedInsights, setGeneratedInsights] = useState<GeneratedInsight[]>([]);
  const [selectedConnector, setSelectedConnector] = useState<(typeof connections)[number] | null>(null);
  const { records: liveLeads, mode: leadMode, error: leadLoadError, createLead, updateStage, reload, selectedProductIsConfigured } = useWorkspaceLeads(productKey);
  const { connectors, mode: connectorMode, error: connectorError, reload: reloadConnectors } = useConnectorStatus(active === 'Account registry');
  useEffect(() => { if (openLeadFormSignal > 0) setShowLeadForm(true); }, [openLeadFormSignal]);
  const es = language === 'es';
  const text = (en: string, spanish: string) => es ? spanish : en;
  const connectorByProvider = new Map(connectors.map(item => [item.provider, item]));
  const connectorErrorMessage = connectorError === 'NETLIFY_RUNTIME_REQUIRED' ? text('Configuration status is available on the production site or when using Netlify Dev.', 'El estado de configuración está disponible en producción o al usar Netlify Dev.') : connectorError;
  const connectorStatusLabel = (provider: string) => connectorMode === 'loading' ? text('Checking', 'Comprobando') : connectorMode === 'error' ? text('Unavailable', 'No disponible') : connectorByProvider.get(provider)?.configured ? text('Configured', 'Configurado') : text('Needs setup', 'Requiere configuración');
  const connectorSteps = (provider: string) => {
    if (provider === 'openai') return [text('Create or select an OpenAI API project with controlled billing and usage limits.', 'Crea o selecciona un proyecto de OpenAI API con facturación y límites de uso controlados.'), text('Save the API key and chosen model only in Netlify environment variables.', 'Guarda la clave API y el modelo elegido solamente en las variables de entorno de Netlify.'), text('Run a signed-in recommendation test before treating the connector as healthy.', 'Ejecuta una prueba autenticada de recomendación antes de considerar saludable la conexión.')];
    if (provider === 'netlify') return [text('Use the SignalDesk Netlify site ID and a least-privilege personal access token.', 'Usa el ID del sitio SignalDesk en Netlify y un token personal con privilegios mínimos.'), text('Store both values in the protected production environment.', 'Guarda ambos valores en el entorno protegido de producción.'), text('Verify forms and deployment events separately after configuration.', 'Verifica formularios y eventos de despliegue por separado después de configurar.')];
    if (provider === 'firebase') return [text('Select the Firebase project whose application events should be measured.', 'Selecciona el proyecto Firebase cuyos eventos de aplicación deben medirse.'), text('Create a reporting-only service identity and keep its private key server-side.', 'Crea una identidad de servicio solo para reportes y conserva su clave privada en el servidor.'), text('Validate the intended project and event stream before importing metrics.', 'Valida el proyecto y flujo de eventos correctos antes de importar métricas.')];
    if (provider === 'meta') return [text('Choose the Meta Business advertising account to report.', 'Elige la cuenta publicitaria de Meta Business que se reportará.'), text('Authorize only the permissions required to read campaign performance.', 'Autoriza solamente los permisos necesarios para leer el rendimiento de campañas.'), text('Test account access and token expiry before the first sync.', 'Prueba el acceso a la cuenta y vencimiento del token antes de la primera sincronización.')];
    return [text('Create Google OAuth web credentials in the reporting project.', 'Crea credenciales OAuth web de Google en el proyecto de reportes.'), text('Enable only the required reporting API and authorize read-only access.', 'Activa solamente la API de reportes necesaria y autoriza acceso de solo lectura.'), text('Store the identifiers and refresh token in Netlify, then run a test sync.', 'Guarda identificadores y token de actualización en Netlify y ejecuta una sincronización de prueba.')];
  };
  const stageLabel = (stage: LeadStage) => ({ new_inquiry: text('New inquiry', 'Nueva consulta'), discovery: text('Discovery', 'Descubrimiento'), qualified: text('Qualified', 'Calificado'), proposal: text('Proposal', 'Propuesta'), won: text('Won', 'Ganado'), lost: text('Lost', 'Perdido') })[stage];
  const opportunities: Opportunity[] = leadMode === 'demo' ? demoOpportunities : liveLeads.map(item => ({ id: item.id, name: item.name, email: item.email, company: item.company || text('Independent', 'Independiente'), service: item.service || '—', stage: stageLabel(item.stage), stageKey: item.stage, value: formatLeadValue(item.estimated_value_min, item.estimated_value_max), source: item.source || text('Unknown', 'Sin fuente') }));
  const filteredOpportunities = useMemo(() => opportunities.filter(item =>
    `${item.name} ${item.company} ${item.service} ${item.stage}`.toLowerCase().includes(query.toLowerCase())
  ), [opportunities, query]);

  const stageCounts = stageOrder.reduce<Record<LeadStage, number>>((counts, stage) => ({ ...counts, [stage]: opportunities.filter(item => item.stageKey === stage).length }), { new_inquiry: 0, discovery: 0, qualified: 0, proposal: 0, won: 0, lost: 0 });

  async function submitLead(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSavingLead(true); setLeadFormError('');
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const numberOrNull = (value: FormDataEntryValue | null) => value && String(value).trim() ? Number(value) : null;
    const draft: LeadDraft = { name: String(form.get('name') || ''), email: String(form.get('email') || ''), company: String(form.get('company') || ''), service: String(form.get('service') || ''), source: String(form.get('source') || 'Manual entry'), estimatedValueMin: numberOrNull(form.get('estimatedValueMin')), estimatedValueMax: numberOrNull(form.get('estimatedValueMax')) };
    if (draft.estimatedValueMin !== null && draft.estimatedValueMax !== null && draft.estimatedValueMax < draft.estimatedValueMin) {
      setLeadFormError(text('Maximum value must be greater than or equal to minimum value.', 'El valor máximo debe ser mayor o igual al valor mínimo.'));
      setSavingLead(false);
      return;
    }
    try {
      await createLead(draft);
      setSaved(true);
      formElement.reset();
      setTimeout(() => { setSaved(false); setShowLeadForm(false); }, 900);
    } catch (error) {
      setLeadFormError(error instanceof Error ? error.message : text('The lead could not be saved.', 'No se pudo guardar el prospecto.'));
    } finally { setSavingLead(false); }
  }

  async function changeStage(id: string, stage: LeadStage) {
    setLeadActionError('');
    try { await updateStage(id, stage); }
    catch (error) { setLeadActionError(error instanceof Error ? error.message : text('The stage could not be updated.', 'No se pudo actualizar la etapa.')); }
  }

  const title = active === 'Leads & pipeline' ? text('Sales pipeline', 'Embudo de ventas') : active === 'Companies' ? text('Companies', 'Empresas') : active === 'Campaigns' ? text('Campaigns', 'Campañas') : active === 'Analytics' ? text('Analytics', 'Analítica') : active === 'AI recommendations' ? text('AI recommendations', 'Recomendaciones IA') : active === 'Conversations' ? text('Conversations', 'Conversaciones') : active === 'Products & goals' ? text('Products & goals', 'Productos y objetivos') : active === 'Guide & onboarding' ? text('Guide & onboarding', 'Guía y configuración') : text('Account registry', 'Registro de cuentas');
  const subtitles: Record<string, string> = {
    'Leads & pipeline': text('Qualify every inquiry and keep the next action visible.', 'Califica cada consulta y mantén visible la próxima acción.'),
    Companies: text('A single relationship history for every account and client.', 'Un historial único de relación para cada cuenta y cliente.'),
    Campaigns: text('Connect spend to inquiries, qualified leads and won work.', 'Relaciona la inversión con consultas, prospectos calificados y ventas.'),
    Analytics: text(`Performance across ${product.toLowerCase()}.`, `Rendimiento de ${product.toLowerCase()}.`),
    'AI recommendations': text('Evidence-backed opportunities generated from your connected marketing data.', 'Oportunidades respaldadas por evidencia y generadas desde tus datos de marketing.'),
    Conversations: text('Review inquiries, AI summaries and human follow-up.', 'Revisa consultas, resúmenes de IA y seguimiento humano.'),
    'Products & goals': text('Define what the workspace markets and keep reporting scopes separated.', 'Define qué promociona el espacio y mantén separados los alcances de reporte.'),
    'Account registry': text('Connection ownership and readiness without storing passwords.', 'Controla conexiones y responsables sin guardar contraseñas.'),
    'Guide & onboarding': text('Learn the product goals, workflow, modules and data-safety rules.', 'Aprende los objetivos, flujo, módulos y reglas de seguridad de datos.'),
  };
  const showModuleTools = !['Products & goals', 'Account registry', 'Guide & onboarding'].includes(active);

  async function generateRecommendations() {
    setGenerating(true); setAiError('');
    try {
      const sessionResult = supabase ? await supabase.auth.getSession() : null;
      const session = sessionResult?.data.session;
      if (!session) throw new Error(text('Connect Supabase and sign in first.', 'Primero conecta Supabase e inicia sesión.'));
      const membership = await supabase!.from('workspace_members').select('workspace_id').limit(1).single();
      if (membership.error || !membership.data?.workspace_id) throw new Error(text('No workspace membership was found.', 'No se encontró una membresía de espacio.'));
      const response = await fetch('/api/ai-recommendations', { method: 'POST', headers: { 'content-type': 'application/json', authorization: `Bearer ${session.access_token}` }, body: JSON.stringify({ workspace_id: membership.data.workspace_id, product, period: 'last_30_days', metrics: { visits: 184, inquiries: 48, qualified_leads: 24, note: 'Representative metrics until live connectors are configured' } }) });
      const data = await response.json() as { recommendations?: GeneratedInsight[]; error?: string };
      if (!response.ok || !data.recommendations) throw new Error(data.error || text('Generation failed.', 'La generación falló.'));
      setGeneratedInsights(data.recommendations);
    } catch (error) { setAiError(error instanceof Error ? error.message : text('Generation failed.', 'La generación falló.')); }
    finally { setGenerating(false); }
  }

  return <section className="workspace-module">
    <div className="module-header">
      <div><p className="eyebrow"><span /> {text('Workspace module', 'Módulo del espacio')}</p><h2>{title}</h2><p>{subtitles[active]}</p></div>
      {showModuleTools && <div className="module-actions"><label className="module-search"><Search size={14} /><input value={query} onChange={event => setQuery(event.target.value)} placeholder={text('Search this module', 'Buscar en este módulo')} /></label><button className="button button-quiet"><Filter size={14} /> {text('Filter', 'Filtrar')}</button>{active === 'Leads & pipeline' && <button className="button button-primary" onClick={() => setShowLeadForm(true)}><Plus size={15} /> {text('Add lead', 'Añadir prospecto')}</button>}</div>}
    </div>

    {active === 'Leads & pipeline' && <>
      <div className={`crm-source-banner source-${leadMode}`}><span>{leadMode === 'loading' ? <LoaderCircle className="spin" size={16} /> : <Database size={16} />}</span><div><strong>{leadMode === 'live' ? text('Live Supabase pipeline', 'Embudo conectado a Supabase') : leadMode === 'loading' ? text('Loading your CRM records…', 'Cargando tus registros…') : leadMode === 'error' ? text('Live records are temporarily unavailable', 'Los registros no están disponibles temporalmente') : text('Representative demo records', 'Registros demostrativos')}</strong><small>{leadMode === 'live' ? (selectedProductIsConfigured ? text('New leads and stage changes are saved to your private workspace.', 'Los nuevos prospectos y cambios de etapa se guardan en tu espacio privado.') : text('Create this product in the registry before assigning product-specific leads.', 'Crea este producto en el registro antes de asignarle prospectos.')) : leadMode === 'error' ? leadLoadError : text('Connect and sign in to Supabase to persist changes.', 'Conecta e inicia sesión en Supabase para guardar cambios.')}</small></div>{leadMode === 'error' && <button type="button" onClick={() => void reload()}><RefreshCw size={13} /> {text('Retry', 'Reintentar')}</button>}</div>
      {leadActionError && <div className="auth-error">{leadActionError}</div>}
      <div className="module-kpis"><Kpi label={text('New inquiries', 'Nuevas consultas')} value={String(stageCounts.new_inquiry)} note={text('Awaiting first review', 'Esperando primera revisión')} /><Kpi label={text('Qualified', 'Calificados')} value={String(stageCounts.qualified)} note={text('Ready for follow-up', 'Listos para seguimiento')} /><Kpi label={text('Proposals', 'Propuestas')} value={String(stageCounts.proposal)} note={text('Commercial conversations', 'Conversaciones comerciales')} /><Kpi label={text('Won', 'Ganados')} value={String(stageCounts.won)} note={text('Closed successfully', 'Cerrados con éxito')} /></div>
      <div className="data-panel"><div className="data-panel-head"><strong>{text('Active opportunities', 'Oportunidades activas')}</strong><span>{filteredOpportunities.length} {text('records', 'registros')}</span></div><div className="table-scroll"><table><thead><tr><th>{text('Contact', 'Contacto')}</th><th>{text('Service', 'Servicio')}</th><th>{text('Stage', 'Etapa')}</th><th>{text('Value', 'Valor')}</th><th>{text('Source', 'Fuente')}</th><th /></tr></thead><tbody>{filteredOpportunities.map(item => <tr key={item.id ?? item.name}><td><strong>{item.name}</strong><small>{item.company}{item.email ? ` · ${item.email}` : ''}</small></td><td>{item.service}</td><td>{item.id && leadMode === 'live' ? <select className="stage-select" value={item.stageKey} onChange={event => void changeStage(item.id!, event.target.value as LeadStage)} aria-label={`${text('Stage for', 'Etapa de')} ${item.name}`}>{stageOrder.map(stage => <option value={stage} key={stage}>{stageLabel(stage)}</option>)}</select> : <Status value={item.stage} />}</td><td>{item.value}</td><td>{item.source}</td><td><button aria-label={`${text('Actions for', 'Acciones para')} ${item.name}`}><MoreHorizontal size={16} /></button></td></tr>)}</tbody></table>{leadMode === 'live' && filteredOpportunities.length === 0 && <div className="empty-table"><Inbox size={24} /><strong>{text('No leads in this scope yet', 'Aún no hay prospectos en este alcance')}</strong><span>{text('Add the first opportunity or select All products.', 'Añade la primera oportunidad o selecciona Todos los productos.')}</span></div>}</div></div>
    </>}

    {active === 'Companies' && <div className="company-grid">{companies.filter(item => `${item.name} ${item.contact}`.toLowerCase().includes(query.toLowerCase())).map(item => <article className="company-card" key={item.name}><div className="company-icon"><Building2 size={18} /></div><Status value={item.status} /><h3>{item.name}</h3><p>{item.contact}</p><div><span><strong>{item.projects}</strong> Projects</span><span><strong>{item.value}</strong> Value</span></div><button>Open account <ArrowUpRight size={13} /></button></article>)}</div>}

    {active === 'Campaigns' && <div className="campaign-grid">{campaigns.map(item => <article className="campaign-card" key={item.name}><div className="campaign-head"><span className="campaign-icon"><Target size={17} /></span><Status value={item.status} /></div><h3>{item.name}</h3><p>{item.channel} · {item.product}</p><div className="campaign-stats"><span><small>Spend</small><strong>{item.spend}</strong></span><span><small>Leads</small><strong>{item.leads}</strong></span><span><small>CPL</small><strong>{item.cpl}</strong></span></div><button>View campaign <ArrowUpRight size={13} /></button></article>)}</div>}

    {active === 'Analytics' && <><div className="module-kpis"><Kpi label={text('Tracked products', 'Productos medidos')} value="4" note={text('1 web · 2 apps · games', '1 web · 2 apps · juegos')} /><Kpi label={text('Total visits', 'Visitas totales')} value="184" note={text('Demo period', 'Período demo')} /><Kpi label={text('AdMob revenue', 'Ingresos AdMob')} value="—" note={text('Connection required', 'Requiere conexión')} /><Kpi label={text('Google Ads spend', 'Inversión Google Ads')} value="—" note={text('Connection required', 'Requiere conexión')} /></div><div className="data-panel"><div className="data-panel-head"><strong>{text('Product performance', 'Rendimiento por producto')}</strong><span>{text('Representative data', 'Datos representativos')}</span></div><div className="product-performance">{['ClubGamerZone website','Organify','CV Enhancer','Games portfolio'].map((name, index) => <div key={name}><span>{name}</span><div><i style={{width: `${[82,58,66,43][index]}%`}} /></div><strong>{[96,42,58,31][index]} {text('visits', 'visitas')}</strong></div>)}</div></div><div className="ad-platform-strip"><div><span className="connection-icon"><CircleDollarSign size={17} /></span><p><strong>Google Ads</strong><small>{text('Acquisition: spend, clicks, conversions and qualified-lead cost', 'Adquisición: inversión, clics, conversiones y costo por prospecto calificado')}</small></p></div><div><span className="connection-icon"><BadgeDollarSign size={17} /></span><p><strong>Google AdMob</strong><small>{text('Monetization: revenue, impressions, eCPM and fill rate', 'Monetización: ingresos, impresiones, eCPM y tasa de cobertura')}</small></p></div></div></>}

    {active === 'AI recommendations' && <><div className="ai-guardrail"><Bot size={19} /><div><strong>{text('Copilot mode', 'Modo copiloto')}</strong><span>{text('AI can analyze and recommend. Budget changes, campaign edits and publishing always require approval.', 'La IA puede analizar y recomendar. Los cambios de presupuesto, campañas y publicaciones siempre requieren aprobación.')}</span></div><button className="button button-primary" onClick={generateRecommendations} disabled={generating}>{generating ? text('Analyzing…', 'Analizando…') : text('Generate now', 'Generar ahora')}</button></div>{aiError && <div className="auth-error">{aiError}</div>}<div className="ai-insight-grid">{generatedInsights.length ? generatedInsights.map((item, index) => <Insight key={`${item.title}-${index}`} priority={item.priority} title={item.title} evidence={`${item.evidence.map(entry => `${entry.metric}: ${entry.value} (${entry.comparison})`).join(' · ')} ${item.expected_impact}`} action={item.suggested_action} confidence={`${Math.round(item.confidence * 100)}%`} />) : <><Insight priority={text('High impact', 'Alto impacto')} title={text('Protect high-intent search traffic', 'Protege el tráfico de búsqueda con alta intención')} evidence={text('Qualified leads from search are represented as 23% less expensive than the blended paid-channel average.', 'Los prospectos calificados de búsqueda aparecen 23% más económicos que el promedio combinado de canales pagos.')} action={text('Review campaign allocation', 'Revisar distribución de campaña')} confidence="82%" /><Insight priority={text('Opportunity', 'Oportunidad')} title={text('Improve the AI-services landing path', 'Mejora la ruta de servicios de IA')} evidence={text('The AI-integration page attracts interest, but the demo funnel indicates a drop before project inquiry.', 'La página de integración de IA genera interés, pero el embudo demo indica una caída antes de la consulta.')} action={text('Create an experiment', 'Crear un experimento')} confidence="76%" /><Insight priority={text('Monetization', 'Monetización')} title={text('Connect AdMob before optimizing ad units', 'Conecta AdMob antes de optimizar anuncios')} evidence={text('Revenue, impressions, eCPM and fill rate are unavailable, so no reliable monetization recommendation can be calculated yet.', 'No hay datos de ingresos, impresiones, eCPM ni cobertura; todavía no puede calcularse una recomendación confiable.')} action={text('Configure AdMob', 'Configurar AdMob')} confidence={text('Blocked', 'Bloqueado')} /></>}</div><div className="ai-method"><strong>{text('How recommendations are produced', 'Cómo se producen las recomendaciones')}</strong><span>1. {text('Validate source data', 'Validar datos')} → 2. {text('Detect change or anomaly', 'Detectar cambios o anomalías')} → 3. {text('Generate structured advice', 'Generar consejo estructurado')} → 4. {text('Human approval', 'Aprobación humana')} → 5. {text('Measure the result', 'Medir el resultado')}</span></div></>}

    {active === 'Conversations' && <div className="conversation-layout"><div className="conversation-list"><button className="conversation-item selected"><span className="lead-avatar avatar-aqua">MR</span><span><strong>Mariana Rojas</strong><small>AI automation quotation</small></span><time>8m</time></button><button className="conversation-item"><span className="lead-avatar avatar-violet">SA</span><span><strong>Sofia Alvarez</strong><small>New website inquiry</small></span><time>2h</time></button><button className="conversation-item"><span className="lead-avatar avatar-coral">DL</span><span><strong>Daniel López</strong><small>Mobile product follow-up</small></span><time>1d</time></button></div><div className="conversation-preview"><div className="conversation-title"><div><strong>Mariana Rojas</strong><span>Northstar Health · AI assistant</span></div><Status value="Qualified" /></div><div className="summary-card"><Bot size={18} /><div><strong>Conversation summary</strong><p>Interested in automating intake and internal document review. Estimated 20–40 users. Requested a discovery call and a preliminary range.</p></div></div><div className="conversation-next"><CheckCircle2 size={17} /><div><strong>Recommended next action</strong><span>Reply with scheduling options and confirm the systems that require integration.</span></div></div><button className="button button-primary">Open conversation <ArrowUpRight size={14} /></button></div></div>}

    {active === 'Products & goals' && <ProductCatalog language={language} />}

    {active === 'Account registry' && <><div className={`crm-source-banner source-${connectorMode}`}><span>{connectorMode === 'loading' ? <LoaderCircle className="spin" size={16} /> : <Database size={16} />}</span><div><strong>{connectorMode === 'live' ? text('Server configuration checked', 'Configuración del servidor comprobada') : connectorMode === 'loading' ? text('Checking server configuration…', 'Comprobando configuración del servidor…') : text('Configuration status unavailable', 'Estado de configuración no disponible')}</strong><small>{connectorMode === 'live' ? text('Configured means the required environment variables exist; it does not guarantee that an external OAuth token is still valid.', 'Configurado significa que existen las variables de entorno requeridas; no garantiza que un token OAuth externo siga vigente.') : connectorErrorMessage}</small></div>{connectorMode === 'error' && <button onClick={() => void reloadConnectors()}><RefreshCw size={13} /> {text('Retry', 'Reintentar')}</button>}</div><div className="registry-warning"><Database size={18} /><div><strong>{text('Secrets stay outside CRM records', 'Los secretos permanecen fuera del CRM')}</strong><span>{text('Use OAuth or protected environment secrets. Passwords and tokens must never be saved in ordinary CRM records.', 'Usa OAuth o secretos de entorno protegidos. Las contraseñas y tokens nunca deben guardarse en registros normales del CRM.')}</span></div></div><div className="connection-grid">{connections.map(item => <article className="connection-card" key={item.name}><span className="connection-icon"><item.icon size={18} /></span><div><h3>{item.name}</h3><p>{item.owner}</p></div><Status value={connectorStatusLabel(item.provider)} /><small>{item.detail}</small><button onClick={() => setSelectedConnector(item)}>{text('View setup guide', 'Ver guía de configuración')} <ArrowUpRight size={13} /></button></article>)}</div></>}

    {selectedConnector && <div className="modal-backdrop" role="presentation" onMouseDown={() => setSelectedConnector(null)}><section className="lead-modal connector-guide-modal" onMouseDown={event => event.stopPropagation()}><div className="modal-head"><div><span>{text('Protected integration setup', 'Configuración protegida')}</span><h3>{selectedConnector.name}</h3></div><button type="button" aria-label={text('Close guide', 'Cerrar guía')} onClick={() => setSelectedConnector(null)}><X size={18} /></button></div><p className="connector-guide-intro">{text('SignalDesk stores only connection metadata in CRM records. Add secret values through the Netlify environment, never in this screen.', 'SignalDesk guarda solamente metadatos de conexión en registros CRM. Añade valores secretos mediante el entorno de Netlify, nunca en esta pantalla.')}</p><ol className="connector-setup-list">{connectorSteps(selectedConnector.provider).map(step => <li key={step}>{step}</li>)}</ol><div className="connector-variable-list"><strong>{text('Required environment variables', 'Variables de entorno requeridas')}</strong>{connectorVariables[selectedConnector.provider].map(variable => <code key={variable}>{variable}</code>)}</div><button className="button button-primary" type="button" onClick={() => setSelectedConnector(null)}>{text('Understood', 'Entendido')}</button></section></div>}

    {active === 'Guide & onboarding' && <UserGuide language={language} onNavigate={onNavigate} />}

    {showLeadForm && <div className="modal-backdrop" role="presentation" onMouseDown={() => setShowLeadForm(false)}><form className="lead-modal" onMouseDown={event => event.stopPropagation()} onSubmit={submitLead}><div className="modal-head"><div><span>{text('New opportunity', 'Nueva oportunidad')}</span><h3>{text('Add a lead', 'Añadir prospecto')}</h3></div><button type="button" aria-label={text('Close form', 'Cerrar formulario')} onClick={() => setShowLeadForm(false)}><X size={18} /></button></div><label>{text('Name', 'Nombre')}<input name="name" required placeholder={text('Contact name', 'Nombre del contacto')} /></label><label>{text('Company', 'Empresa')}<input name="company" placeholder={text('Company or organization', 'Empresa u organización')} /></label><div className="form-row"><label>Email<input name="email" required type="email" placeholder="name@company.com" /></label><label>{text('Source', 'Fuente')}<select name="source" defaultValue="Manual entry"><option value="Manual entry">{text('Manual entry', 'Entrada manual')}</option><option value="Website form">{text('Website form', 'Formulario web')}</option><option value="AI assistant">{text('AI assistant', 'Asistente IA')}</option><option value="Referral">{text('Referral', 'Referido')}</option><option value="LinkedIn">LinkedIn</option><option value="Google Ads">Google Ads</option><option value="Meta Ads">Meta Ads</option></select></label></div><div className="form-row"><label>{text('Minimum value (USD)', 'Valor mínimo (USD)')}<input name="estimatedValueMin" min="0" step="1" type="number" placeholder="5000" /></label><label>{text('Maximum value (USD)', 'Valor máximo (USD)')}<input name="estimatedValueMax" min="0" step="1" type="number" placeholder="10000" /></label></div><label>{text('Service', 'Servicio')}<select name="service" defaultValue="AI integration"><option>AI integration</option><option>Custom software</option><option>Web application</option><option>Mobile application</option><option>Game development</option><option>Project leadership</option></select></label>{leadFormError && <div className="auth-error">{leadFormError}</div>}<button className="button button-primary" type="submit" disabled={savingLead || leadMode !== 'live' || !selectedProductIsConfigured}>{saved ? <><CheckCircle2 size={15} /> {text('Saved to CRM', 'Guardado en el CRM')}</> : savingLead ? <><LoaderCircle className="spin" size={15} /> {text('Saving…', 'Guardando…')}</> : <><Plus size={15} /> {text('Create lead', 'Crear prospecto')}</>}</button>{(leadMode !== 'live' || !selectedProductIsConfigured) && <small className="form-help">{!selectedProductIsConfigured ? text('This product is not configured yet. Select All products to save an unassigned lead.', 'Este producto aún no está configurado. Selecciona Todos los productos para guardar un prospecto sin asignar.') : text('Live Supabase access is required to create persistent leads.', 'Se requiere acceso activo a Supabase para crear prospectos persistentes.')}</small>}</form></div>}
  </section>;
}

function Kpi({ label, value, note }: { label: string; value: string; note: string }) { return <article className="module-kpi"><span>{label}</span><strong>{value}</strong><small>{note}</small></article>; }
function Status({ value }: { value: string }) { return <span className={`status-pill status-${value.toLowerCase().replaceAll(' ', '-')}`}>{value}</span>; }
function Insight({ priority, title, evidence, action, confidence }: { priority: string; title: string; evidence: string; action: string; confidence: string }) { return <article className="ai-insight"><div><span>{priority}</span><b>{confidence}</b></div><h3>{title}</h3><p>{evidence}</p><button>{action} <ArrowUpRight size={13} /></button></article>; }
