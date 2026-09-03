import { useEffect, useState } from 'react';
import {
  ArrowUpRight, BarChart3, Bell, Boxes, BrainCircuit, BriefcaseBusiness, ChevronDown,
  Database, Inbox, Languages, LayoutDashboard, Menu, MessageSquare, MoreHorizontal,
  Moon, Plus, Search, Settings2, ShieldCheck, Sparkles, Sun, Target,
} from 'lucide-react';
import OverviewDashboard from './OverviewDashboard';
import WorkspaceModule from './WorkspaceModule';
import { useWorkspaceProducts } from './hooks/useWorkspaceProducts';
import { isSupabaseConfigured } from './lib/supabase';

const nav = [
  { label: 'Overview', icon: LayoutDashboard },
  { label: 'Leads & pipeline', icon: Inbox },
  { label: 'Companies', icon: BriefcaseBusiness },
  { label: 'Campaigns', icon: Target },
  { label: 'Analytics', icon: BarChart3 },
  { label: 'AI recommendations', icon: BrainCircuit },
  { label: 'Conversations', icon: MessageSquare },
  { label: 'Products & goals', icon: Boxes },
  { label: 'Account registry', icon: Database },
];

const fallbackProducts = ['All products', 'ClubGamerZone website', 'Organify', 'CV Enhancer', 'Games portfolio'];

function App() {
  const [active, setActive] = useState('Overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [range, setRange] = useState('Last 30 days');
  const [product, setProduct] = useState('All products');
  const [searchOpen, setSearchOpen] = useState(false);
  const [leadFormSignal, setLeadFormSignal] = useState(0);
  const [language, setLanguage] = useState<'en' | 'es'>(() => localStorage.getItem('signaldesk-language') === 'es' ? 'es' : 'en');
  const [theme, setTheme] = useState<'light' | 'dark'>(() => localStorage.getItem('signaldesk-theme') === 'dark' ? 'dark' : 'light');
  const { products: liveProducts, mode: productMode } = useWorkspaceProducts();
  const productOptions = productMode === 'live' ? ['All products', ...liveProducts.map(item => item.name)] : fallbackProducts;
  const es = language === 'es';
  const text = (en: string, spanish: string) => es ? spanish : en;
  const dateLabel = new Intl.DateTimeFormat(es ? 'es-CO' : 'en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }).format(new Date());
  const navLabels: Record<string, string> = { Overview: text('Overview', 'Resumen'), 'Leads & pipeline': text('Leads & pipeline', 'Prospectos y embudo'), Companies: text('Companies', 'Empresas'), Campaigns: text('Campaigns', 'Campañas'), Analytics: text('Analytics', 'Analítica'), 'AI recommendations': text('AI recommendations', 'Recomendaciones IA'), Conversations: text('Conversations', 'Conversaciones'), 'Products & goals': text('Products & goals', 'Productos y objetivos'), 'Account registry': text('Account registry', 'Registro de cuentas'), 'Guide & onboarding': text('Guide & onboarding', 'Guía y configuración') };
  const productLabels: Record<string, string> = { 'All products': text('All products', 'Todos los productos'), 'ClubGamerZone website': text('ClubGamerZone website', 'Sitio ClubGamerZone'), Organify: 'Organify', 'CV Enhancer': text('CV Enhancer', 'Optimizador de CV'), 'Games portfolio': text('Games portfolio', 'Portafolio de juegos') };
  const selectedProductLabel = productLabels[product] ?? product;

  useEffect(() => { document.documentElement.dataset.theme = theme; localStorage.setItem('signaldesk-theme', theme); }, [theme]);
  useEffect(() => { document.documentElement.lang = language; localStorage.setItem('signaldesk-language', language); }, [language]);
  useEffect(() => { if (productMode === 'live' && !productOptions.includes(product)) setProduct('All products'); }, [product, productMode, productOptions]);

  return <div className="app-shell">
    <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
      <div className="brand"><span className="brand-mark"><Sparkles size={16} /></span><span>signal<span className="brand-accent">desk</span></span></div>
      <div className="workspace-switcher"><span className="workspace-avatar">C</span><span><small>{text('Workspace', 'Espacio')}</small><strong>ClubGamerZone</strong></span><ChevronDown size={15} /></div>
      <nav className="main-nav" aria-label={text('Main navigation', 'Navegación principal')}>{nav.map(item => <button key={item.label} className={active === item.label ? 'nav-item active' : 'nav-item'} onClick={() => { setActive(item.label); setSidebarOpen(false); }}><item.icon size={17} /><span>{navLabels[item.label]}</span></button>)}</nav>
      <div className="sidebar-bottom"><div className="health-card"><span className="pulse-dot" /><div><strong>{isSupabaseConfigured ? text('Workspace connected', 'Espacio conectado') : text('Demo workspace ready', 'Espacio demo listo')}</strong><small>{text('External connections pending', 'Conexiones externas pendientes')}</small></div></div><button className={active === 'Guide & onboarding' ? 'nav-item active' : 'nav-item'} onClick={() => { setActive('Guide & onboarding'); setSidebarOpen(false); }}><Settings2 size={17} /><span>{text('Guide & onboarding', 'Guía y configuración')}</span></button><div className="user-row"><span className="user-avatar">JD</span><span><strong>Jose Demoya</strong><small>{text('Administrator', 'Administrador')}</small></span><MoreHorizontal size={16} /></div></div>
    </aside>
    {sidebarOpen && <button className="scrim" aria-label={text('Close navigation', 'Cerrar navegación')} onClick={() => setSidebarOpen(false)} />}
    <main className="main-content">
      <header className="topbar"><button className="mobile-menu" onClick={() => setSidebarOpen(true)} aria-label={text('Open navigation', 'Abrir navegación')}><Menu size={20} /></button><div className="breadcrumbs"><span>{text('Workspace', 'Espacio')}</span><span>/</span><strong>{navLabels[active]}</strong></div><div className="top-actions"><button className="preference-button" onClick={() => setLanguage(es ? 'en' : 'es')} aria-label={text('Switch to Spanish', 'Cambiar a inglés')}><Languages size={14} /><span>{es ? '🇨🇴 ES' : '🇺🇸 EN'}</span></button><button className="icon-button theme-toggle" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} aria-label={text('Toggle dark mode', 'Cambiar modo oscuro')}>{theme === 'light' ? <Moon size={17} /> : <Sun size={17} />}</button>{searchOpen ? <div className="search-field"><Search size={15} /><input autoFocus placeholder={text('Search leads, companies...', 'Buscar prospectos, empresas...')} onBlur={() => setSearchOpen(false)} /></div> : <button className="icon-button" aria-label={text('Search', 'Buscar')} onClick={() => setSearchOpen(true)}><Search size={18} /></button>}<button className="icon-button notification" aria-label={text('Notifications', 'Notificaciones')}><Bell size={18} /><i /></button><button className="top-avatar">JD</button></div></header>
      <div className="page-wrap">
        <section className="page-heading"><div><p className="eyebrow"><span /> {dateLabel}</p><h1>{active === 'Overview' ? <>{text('Good morning, Jose', 'Buenos días, Jose')}<span>.</span></> : <>{navLabels[active]}<span>.</span></>}</h1><p className="subheading">{active === 'Overview' ? text('Here’s the pulse of your growth engine.', 'Este es el pulso de tu motor de crecimiento.') : text('ClubGamerZone growth workspace.', 'Espacio de crecimiento de ClubGamerZone.')}</p></div><div className="heading-actions"><label className="scope-select"><small>{text('Reporting scope', 'Alcance')}</small><select value={product} onChange={event => setProduct(event.target.value)} aria-label={text('Reporting scope', 'Alcance del reporte')}>{productOptions.map(item => <option key={item} value={item}>{productLabels[item] ?? item}</option>)}</select></label><label className="scope-select"><small>{text('Date range', 'Período')}</small><select value={range} onChange={event => setRange(event.target.value)} aria-label={text('Date range', 'Período')}><option value="Last 7 days">{text('Last 7 days', 'Últimos 7 días')}</option><option value="Last 30 days">{text('Last 30 days', 'Últimos 30 días')}</option><option value="This quarter">{text('This quarter', 'Este trimestre')}</option><option value="This year">{text('This year', 'Este año')}</option></select></label><button className="button button-primary" onClick={() => { setActive('Leads & pipeline'); setLeadFormSignal(value => value + 1); }}><Plus size={16} /> {text('Add lead', 'Añadir prospecto')}</button></div></section>
        {!['Overview', 'Leads & pipeline', 'Products & goals', 'Account registry', 'Guide & onboarding'].includes(active) && <div className="demo-banner"><span className="demo-pulse" /><div><strong>{text('Demo workspace', 'Espacio de demostración')}</strong><span>{selectedProductLabel} · {text('Connect your data sources to replace these representative values with live performance.', 'Conecta tus fuentes de datos para reemplazar estos valores representativos con rendimiento real.')}</span></div><button onClick={() => setActive('Account registry')}>{text('Review connections', 'Revisar conexiones')} <ArrowUpRight size={14} /></button></div>}
        {active === 'Overview' ? <OverviewDashboard product={product} range={range} language={language} onNavigate={setActive} /> : <WorkspaceModule active={active} product={selectedProductLabel} productKey={product} language={language} openLeadFormSignal={leadFormSignal} onNavigate={setActive} />}
        <footer className="page-footer"><span><ShieldCheck size={14} /> {text('Private workspace · Data stays under your control', 'Espacio privado · Tus datos permanecen bajo tu control')}</span><span>SignalDesk v0.2 · <a href="https://github.com/clubgamerzone" target="_blank" rel="noreferrer">ClubGamerZone</a></span></footer>
      </div>
    </main>
  </div>;
}

export default App;
