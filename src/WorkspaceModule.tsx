import { useEffect, useMemo, useState } from 'react';
import {
  ArrowUpRight, BarChart3, Bot, Building2, CheckCircle2,
  CircleDollarSign, Database, Filter, Globe2,
  MoreHorizontal, Plus, Search, Target, X,
} from 'lucide-react';

type ModuleProps = { active: string; product: string; language: 'en' | 'es'; openLeadFormSignal?: number };

const opportunities = [
  { name: 'Mariana Rojas', company: 'Northstar Health', service: 'AI automation', stage: 'Qualified', value: '$18k–$25k', source: 'AI assistant' },
  { name: 'Daniel López', company: 'Lumen Foods', service: 'Mobile product', stage: 'Discovery', value: '$12k–$18k', source: 'Referral' },
  { name: 'Sofia Alvarez', company: 'Independent', service: 'Web platform', stage: 'New inquiry', value: '$8k–$12k', source: 'Website form' },
  { name: 'James Turner', company: 'Redwood Labs', service: 'Custom software', stage: 'Proposal', value: '$25k+', source: 'LinkedIn' },
];

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
];

const connections = [
  { name: 'Google Analytics 4', owner: 'ClubGamerZone website', icon: BarChart3, status: 'Not connected', detail: 'Visits, acquisition and conversions' },
  { name: 'Netlify', owner: 'ClubGamerZone website', icon: Globe2, status: 'Needs token', detail: 'Deployments, forms and serverless events' },
  { name: 'Meta Business', owner: 'Marketing workspace', icon: Target, status: 'Not connected', detail: 'Campaigns, spend and lead attribution' },
  { name: 'Google Ads', owner: 'Marketing workspace', icon: CircleDollarSign, status: 'Not connected', detail: 'Search campaigns and conversion costs' },
  { name: 'Firebase', owner: 'Organify / apps', icon: Database, status: 'Not connected', detail: 'App events and audience activity' },
  { name: 'AI assistant', owner: 'ClubGamerZone website', icon: Bot, status: 'Endpoint pending', detail: 'Qualified conversations and summaries' },
];

export default function WorkspaceModule({ active, product, language, openLeadFormSignal = 0 }: ModuleProps) {
  const [query, setQuery] = useState('');
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [saved, setSaved] = useState(false);
  useEffect(() => { if (openLeadFormSignal > 0) setShowLeadForm(true); }, [openLeadFormSignal]);
  const filteredOpportunities = useMemo(() => opportunities.filter(item =>
    `${item.name} ${item.company} ${item.service} ${item.stage}`.toLowerCase().includes(query.toLowerCase())
  ), [query]);
  const es = language === 'es';
  const text = (en: string, spanish: string) => es ? spanish : en;

  const title = active === 'Leads & pipeline' ? text('Sales pipeline', 'Embudo de ventas') : active === 'Companies' ? text('Companies', 'Empresas') : active === 'Campaigns' ? text('Campaigns', 'Campañas') : active === 'Analytics' ? text('Analytics', 'Analítica') : active === 'Conversations' ? text('Conversations', 'Conversaciones') : text('Account registry', 'Registro de cuentas');
  const subtitles: Record<string, string> = {
    'Leads & pipeline': text('Qualify every inquiry and keep the next action visible.', 'Califica cada consulta y mantén visible la próxima acción.'),
    Companies: text('A single relationship history for every account and client.', 'Un historial único de relación para cada cuenta y cliente.'),
    Campaigns: text('Connect spend to inquiries, qualified leads and won work.', 'Relaciona la inversión con consultas, prospectos calificados y ventas.'),
    Analytics: text(`Performance across ${product.toLowerCase()}.`, `Rendimiento de ${product.toLowerCase()}.`),
    Conversations: text('Review inquiries, AI summaries and human follow-up.', 'Revisa consultas, resúmenes de IA y seguimiento humano.'),
    'Account registry': text('Connection ownership and readiness without storing passwords.', 'Controla conexiones y responsables sin guardar contraseñas.'),
  };

  return <section className="workspace-module">
    <div className="module-header">
      <div><p className="eyebrow"><span /> {text('Workspace module', 'Módulo del espacio')}</p><h2>{title}</h2><p>{subtitles[active]}</p></div>
      <div className="module-actions"><label className="module-search"><Search size={14} /><input value={query} onChange={event => setQuery(event.target.value)} placeholder={text('Search this module', 'Buscar en este módulo')} /></label><button className="button button-quiet"><Filter size={14} /> {text('Filter', 'Filtrar')}</button>{active === 'Leads & pipeline' && <button className="button button-primary" onClick={() => setShowLeadForm(true)}><Plus size={15} /> {text('Add lead', 'Añadir prospecto')}</button>}</div>
    </div>

    {active === 'Leads & pipeline' && <>
      <div className="module-kpis"><Kpi label={text('New inquiries', 'Nuevas consultas')} value="12" note={text('4 need a response', '4 necesitan respuesta')} /><Kpi label={text('Qualified', 'Calificados')} value="6" note={text('50% qualification rate', '50% de calificación')} /><Kpi label={text('Proposals', 'Propuestas')} value="4" note={text('$76k potential', '$76k potencial')} /><Kpi label={text('Won', 'Ganados')} value="2" note={text('This month', 'Este mes')} /></div>
      <div className="data-panel"><div className="data-panel-head"><strong>{text('Active opportunities', 'Oportunidades activas')}</strong><span>{filteredOpportunities.length} {text('records', 'registros')}</span></div><div className="table-scroll"><table><thead><tr><th>{text('Contact', 'Contacto')}</th><th>{text('Service', 'Servicio')}</th><th>{text('Stage', 'Etapa')}</th><th>{text('Value', 'Valor')}</th><th>{text('Source', 'Fuente')}</th><th /></tr></thead><tbody>{filteredOpportunities.map(item => <tr key={item.name}><td><strong>{item.name}</strong><small>{item.company}</small></td><td>{item.service}</td><td><Status value={item.stage} /></td><td>{item.value}</td><td>{item.source}</td><td><button aria-label={`${text('Actions for', 'Acciones para')} ${item.name}`}><MoreHorizontal size={16} /></button></td></tr>)}</tbody></table></div></div>
    </>}

    {active === 'Companies' && <div className="company-grid">{companies.filter(item => `${item.name} ${item.contact}`.toLowerCase().includes(query.toLowerCase())).map(item => <article className="company-card" key={item.name}><div className="company-icon"><Building2 size={18} /></div><Status value={item.status} /><h3>{item.name}</h3><p>{item.contact}</p><div><span><strong>{item.projects}</strong> Projects</span><span><strong>{item.value}</strong> Value</span></div><button>Open account <ArrowUpRight size={13} /></button></article>)}</div>}

    {active === 'Campaigns' && <div className="campaign-grid">{campaigns.map(item => <article className="campaign-card" key={item.name}><div className="campaign-head"><span className="campaign-icon"><Target size={17} /></span><Status value={item.status} /></div><h3>{item.name}</h3><p>{item.channel} · {item.product}</p><div className="campaign-stats"><span><small>Spend</small><strong>{item.spend}</strong></span><span><small>Leads</small><strong>{item.leads}</strong></span><span><small>CPL</small><strong>{item.cpl}</strong></span></div><button>View campaign <ArrowUpRight size={13} /></button></article>)}</div>}

    {active === 'Analytics' && <><div className="module-kpis"><Kpi label="Tracked products" value="4" note="1 web · 2 apps · games" /><Kpi label="Total visits" value="184" note="Demo period" /><Kpi label="Inquiries" value="48" note="26.1% visit rate" /><Kpi label="Qualified leads" value="24" note="50% of inquiries" /></div><div className="data-panel"><div className="data-panel-head"><strong>Product performance</strong><span>Representative data</span></div><div className="product-performance">{['ClubGamerZone website','Organify','CV Enhancer','Games portfolio'].map((name, index) => <div key={name}><span>{name}</span><div><i style={{width: `${[82,58,66,43][index]}%`}} /></div><strong>{[96,42,58,31][index]} visits</strong></div>)}</div></div></>}

    {active === 'Conversations' && <div className="conversation-layout"><div className="conversation-list"><button className="conversation-item selected"><span className="lead-avatar avatar-aqua">MR</span><span><strong>Mariana Rojas</strong><small>AI automation quotation</small></span><time>8m</time></button><button className="conversation-item"><span className="lead-avatar avatar-violet">SA</span><span><strong>Sofia Alvarez</strong><small>New website inquiry</small></span><time>2h</time></button><button className="conversation-item"><span className="lead-avatar avatar-coral">DL</span><span><strong>Daniel López</strong><small>Mobile product follow-up</small></span><time>1d</time></button></div><div className="conversation-preview"><div className="conversation-title"><div><strong>Mariana Rojas</strong><span>Northstar Health · AI assistant</span></div><Status value="Qualified" /></div><div className="summary-card"><Bot size={18} /><div><strong>Conversation summary</strong><p>Interested in automating intake and internal document review. Estimated 20–40 users. Requested a discovery call and a preliminary range.</p></div></div><div className="conversation-next"><CheckCircle2 size={17} /><div><strong>Recommended next action</strong><span>Reply with scheduling options and confirm the systems that require integration.</span></div></div><button className="button button-primary">Open conversation <ArrowUpRight size={14} /></button></div></div>}

    {active === 'Account registry' && <><div className="registry-warning"><Database size={18} /><div><strong>{text('Connections are not live yet', 'Las conexiones aún no están activas')}</strong><span>{text('Use OAuth or environment secrets during implementation. Passwords and tokens must never be saved in ordinary CRM records.', 'Usa OAuth o secretos de entorno durante la implementación. Las contraseñas y tokens nunca deben guardarse en registros normales del CRM.')}</span></div></div><div className="connection-grid">{connections.map(item => <article className="connection-card" key={item.name}><span className="connection-icon"><item.icon size={18} /></span><div><h3>{item.name}</h3><p>{item.owner}</p></div><Status value={item.status} /><small>{item.detail}</small><button>{text('Configure', 'Configurar')} <ArrowUpRight size={13} /></button></article>)}</div></>}

    {showLeadForm && <div className="modal-backdrop" role="presentation" onMouseDown={() => setShowLeadForm(false)}><form className="lead-modal" onMouseDown={event => event.stopPropagation()} onSubmit={event => { event.preventDefault(); setSaved(true); setTimeout(() => { setSaved(false); setShowLeadForm(false); }, 900); }}><div className="modal-head"><div><span>{text('New opportunity', 'Nueva oportunidad')}</span><h3>{text('Add a lead', 'Añadir prospecto')}</h3></div><button type="button" aria-label={text('Close form', 'Cerrar formulario')} onClick={() => setShowLeadForm(false)}><X size={18} /></button></div><label>{text('Name', 'Nombre')}<input required placeholder={text('Contact name', 'Nombre del contacto')} /></label><label>{text('Company', 'Empresa')}<input placeholder={text('Company or organization', 'Empresa u organización')} /></label><div className="form-row"><label>Email<input required type="email" placeholder="name@company.com" /></label><label>{text('Estimated value', 'Valor estimado')}<input placeholder="$5k–$10k" /></label></div><label>{text('Service', 'Servicio')}<select defaultValue="AI integration"><option>AI integration</option><option>Custom software</option><option>Web application</option><option>Mobile application</option><option>Game development</option></select></label><button className="button button-primary" type="submit">{saved ? <><CheckCircle2 size={15} /> {text('Saved locally', 'Guardado localmente')}</> : <><Plus size={15} /> {text('Create lead', 'Crear prospecto')}</>}</button></form></div>}
  </section>;
}

function Kpi({ label, value, note }: { label: string; value: string; note: string }) { return <article className="module-kpi"><span>{label}</span><strong>{value}</strong><small>{note}</small></article>; }
function Status({ value }: { value: string }) { return <span className={`status-pill status-${value.toLowerCase().replaceAll(' ', '-')}`}>{value}</span>; }
