import { useState } from 'react';
import {
  Activity, ArrowUpRight, BarChart3, Bell, Bot, BriefcaseBusiness, ChevronDown,
  CircleDollarSign, Database, Filter, Gauge, Globe2, Inbox, LayoutDashboard,
  Menu, MessageSquare, MoreHorizontal, Plus, Search, Settings2, ShieldCheck,
  Sparkles, Target, Users, X,
} from 'lucide-react';

type Lead = { initials: string; name: string; company: string; service: string; value: string; stage: string; tone: string };

const leads: Lead[] = [
  { initials: 'MR', name: 'Mariana Rojas', company: 'Northstar Health', service: 'AI automation', value: '$18k–$25k', stage: 'Qualified', tone: 'coral' },
  { initials: 'DL', name: 'Daniel López', company: 'Lumen Foods', service: 'Mobile product', value: '$12k–$18k', stage: 'Discovery', tone: 'aqua' },
  { initials: 'SA', name: 'Sofia Alvarez', company: 'Independent', service: 'Web platform', value: '$8k–$12k', stage: 'New inquiry', tone: 'violet' },
  { initials: 'JT', name: 'James Turner', company: 'Redwood Labs', service: 'Custom software', value: '$25k+', stage: 'Proposal', tone: 'lime' },
];

const nav = [
  { label: 'Overview', icon: LayoutDashboard }, { label: 'Leads & pipeline', icon: Inbox, badge: '12' },
  { label: 'Companies', icon: BriefcaseBusiness }, { label: 'Campaigns', icon: Target },
  { label: 'Analytics', icon: BarChart3 }, { label: 'Conversations', icon: MessageSquare },
  { label: 'Account registry', icon: Database },
];

const products = ['All products', 'ClubGamerZone website', 'Organify', 'CV Enhancer', 'Games portfolio'];

function App() {
  const [active, setActive] = useState('Overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [range, setRange] = useState('Last 30 days');
  const [product, setProduct] = useState('All products');
  const [searchOpen, setSearchOpen] = useState(false);

  return <div className="app-shell">
    <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
      <div className="brand"><span className="brand-mark"><Sparkles size={16} /></span><span>signal<span className="brand-accent">desk</span></span></div>
      <div className="workspace-switcher"><span className="workspace-avatar">C</span><span><small>Workspace</small><strong>ClubGamerZone</strong></span><ChevronDown size={15} /></div>
      <nav className="main-nav" aria-label="Main navigation">{nav.map(item => <button key={item.label} className={active === item.label ? 'nav-item active' : 'nav-item'} onClick={() => { setActive(item.label); setSidebarOpen(false); }}><item.icon size={17} /><span>{item.label}</span>{item.badge && <em>{item.badge}</em>}</button>)}</nav>
      <div className="sidebar-bottom"><div className="health-card"><span className="pulse-dot" /><div><strong>All systems healthy</strong><small>7 connections synced</small></div></div><button className="nav-item"><Settings2 size={17} /><span>Settings</span></button><div className="user-row"><span className="user-avatar">JD</span><span><strong>Jose Demoya</strong><small>Administrator</small></span><MoreHorizontal size={16} /></div></div>
    </aside>
    {sidebarOpen && <button className="scrim" aria-label="Close navigation" onClick={() => setSidebarOpen(false)} />}
    <main className="main-content">
      <header className="topbar"><button className="mobile-menu" onClick={() => setSidebarOpen(true)} aria-label="Open navigation"><Menu size={20} /></button><div className="breadcrumbs"><span>Workspace</span><span>/</span><strong>{active}</strong></div><div className="top-actions">{searchOpen ? <div className="search-field"><Search size={15} /><input autoFocus placeholder="Search leads, companies..." onBlur={() => setSearchOpen(false)} /></div> : <button className="icon-button" aria-label="Search" onClick={() => setSearchOpen(true)}><Search size={18} /></button>}<button className="icon-button notification" aria-label="Notifications"><Bell size={18} /><i /></button><button className="top-avatar">JD</button></div></header>
      <div className="page-wrap">
        <section className="page-heading"><div><p className="eyebrow"><span /> Monday, September 1, 2026</p><h1>Good morning, Jose<span>.</span></h1><p className="subheading">Here’s the pulse of your growth engine.</p></div><div className="heading-actions"><label className="scope-select"><small>Reporting scope</small><select value={product} onChange={event => setProduct(event.target.value)} aria-label="Reporting scope">{products.map(item => <option key={item}>{item}</option>)}</select></label><button className="button button-quiet"><Filter size={15} /> Filter</button><button className="button button-primary"><Plus size={16} /> Add lead</button></div></section>
        <div className="demo-banner"><span className="demo-pulse" /><div><strong>Demo workspace</strong><span>{product} · Connect your data sources to replace these representative values with live performance.</span></div><button onClick={() => setActive('Account registry')}>Review connections <ArrowUpRight size={14} /></button></div>
        <section className="metric-grid"><Metric icon={Users} label="Open opportunities" value="24" change="+18.4%" note="vs. previous period" tone="aqua" /><Metric icon={CircleDollarSign} label="Pipeline value" value="$184.6k" change="+12.8%" note="weighted: $92.3k" tone="lime" /><Metric icon={Gauge} label="Qualified rate" value="42.8%" change="+6.2%" note="of new inquiries" tone="violet" /><Metric icon={ArrowUpRight} label="Cost per qualified lead" value="$64.20" change="−14.5%" note="across paid channels" tone="coral" /></section>
        <section className="dashboard-grid"><div className="panel funnel-panel"><PanelHeader title="Funnel performance" detail="Conversion journey" action="View report" /><div className="funnel-chart"><div className="chart-axis"><span>200</span><span>150</span><span>100</span><span>50</span><span>0</span></div><div className="bars">{[['Visits','184',72,'aqua'],['Engaged','112',55,'aqua'],['Inquiries','48',35,'lime'],['Qualified','24',22,'lime'],['Won','7',12,'coral']].map(([label,val,height,tone]) => <div className="bar-column" key={label as string}><div className={`bar bar-${tone}`} style={{height: `${height}%`}}><span>{val}</span></div><small>{label}</small></div>)}</div></div><div className="chart-foot"><span><i className="legend-dot aqua" /> This period</span><span><i className="legend-dot muted" /> Previous period</span><strong>+22.4% <small>overall conversion</small></strong></div></div><div className="panel activity-panel"><PanelHeader title="Live activity" detail="Last 24 hours" action="See all" /><div className="activity-list"><ActivityRow icon={MessageSquare} title="New AI conversation" desc="Project quotation · Web platform" time="8m ago" tone="aqua" /><ActivityRow icon={Globe2} title="Organic visit" desc="/services/ai-integration" time="24m ago" tone="lime" /><ActivityRow icon={Users} title="Lead qualified" desc="Mariana Rojas · Northstar Health" time="1h ago" tone="violet" /><ActivityRow icon={Target} title="Campaign milestone" desc="AI Automation · 100 clicks" time="2h ago" tone="coral" /></div><button className="text-button">Open activity stream <ArrowUpRight size={14} /></button></div></section>
        <section className="dashboard-grid bottom-grid"><div className="panel pipeline-panel"><PanelHeader title="Pipeline" detail="4 active stages" action="Open CRM" /><div className="pipeline-columns">{['New inquiry','Qualified','Proposal','Won'].map((stage, idx) => <div className="pipeline-column" key={stage}><div className="column-head"><span>{stage}</span><b>{idx === 0 ? '12' : idx === 1 ? '6' : idx === 2 ? '4' : '2'}</b></div>{leads.filter(l => l.stage === stage || (idx === 1 && l.stage === 'Discovery')).slice(0, 2).map(lead => <LeadCard key={lead.name} lead={lead} />)}{idx === 0 && <LeadCard lead={leads[2]} />}</div>)}</div></div><div className="panel integrations-panel"><PanelHeader title="Account registry" detail="Connection health" action="Manage" /><div className="integration-list"><Integration icon={BarChart3} name="Google Analytics 4" detail="clubgamerzone.com" status="Synced 12m ago" tone="aqua" /><Integration icon={Target} name="Meta Business" detail="ClubGamerZone" status="Synced 31m ago" tone="violet" /><Integration icon={Bot} name="AI assistant" detail="Netlify Function" status="Operational" tone="lime" /><Integration icon={Globe2} name="Netlify" detail="clubgamerzone-webapp" status="Synced 1h ago" tone="coral" /></div><button className="registry-link">View all connections <ArrowUpRight size={14} /></button></div></section>
        <footer className="page-footer"><span><ShieldCheck size={14} /> Private workspace · Data stays under your control</span><span>SignalDesk v0.1 · <a href="https://github.com/clubgamerzone" target="_blank" rel="noreferrer">ClubGamerZone</a></span></footer>
      </div>
    </main>
  </div>;
}

function Metric({ icon: Icon, label, value, change, note, tone }: { icon: typeof Users; label: string; value: string; change: string; note: string; tone: string }) { return <article className="metric-card"><div className={`metric-icon icon-${tone}`}><Icon size={18} /></div><div className="metric-label">{label}</div><strong className="metric-value">{value}</strong><div className="metric-change"><span className={change.startsWith('−') ? 'negative' : ''}>{change}</span> {note}</div></article>; }
function PanelHeader({ title, detail, action }: { title: string; detail: string; action: string }) { return <div className="panel-header"><div><h2>{title}</h2><span>{detail}</span></div><button className="panel-action">{action} <ArrowUpRight size={13} /></button></div>; }
function ActivityRow({ icon: Icon, title, desc, time, tone }: { icon: typeof Activity; title: string; desc: string; time: string; tone: string }) { return <div className="activity-row"><span className={`activity-icon icon-${tone}`}><Icon size={15} /></span><div><strong>{title}</strong><small>{desc}</small></div><time>{time}</time></div>; }
function LeadCard({ lead }: { lead: Lead }) { return <div className="lead-card"><div className="lead-top"><span className={`lead-avatar avatar-${lead.tone}`}>{lead.initials}</span><button aria-label={`More actions for ${lead.name}`}><MoreHorizontal size={14} /></button></div><strong>{lead.name}</strong><small>{lead.company}</small><div className="lead-meta"><span>{lead.service}</span><b>{lead.value}</b></div></div>; }
function Integration({ icon: Icon, name, detail, status, tone }: { icon: typeof BarChart3; name: string; detail: string; status: string; tone: string }) { return <div className="integration-row"><span className={`integration-icon icon-${tone}`}><Icon size={15} /></span><div><strong>{name}</strong><small>{detail}</small></div><span className="integration-status"><i className={`status-dot dot-${tone}`} />{status}</span></div>; }

export default App;
