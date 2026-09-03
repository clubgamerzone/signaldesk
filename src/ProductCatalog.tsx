import { useState } from 'react';
import { Boxes, CheckCircle2, Globe2, LoaderCircle, Pencil, Plus, RefreshCw, Save, Smartphone, Sparkles, X } from 'lucide-react';
import { type ProductKind, type WorkspaceProduct, useWorkspaceProducts } from './hooks/useWorkspaceProducts';

type Props = { language: 'en' | 'es' };

const demoProducts: WorkspaceProduct[] = [
  { id: 'demo-web', name: 'ClubGamerZone website', kind: 'website', created_at: '' },
  { id: 'demo-organify', name: 'Organify', kind: 'mobile_app', created_at: '' },
  { id: 'demo-cv', name: 'CV Enhancer', kind: 'service', created_at: '' },
  { id: 'demo-games', name: 'Games portfolio', kind: 'game', created_at: '' },
];

export default function ProductCatalog({ language }: Props) {
  const es = language === 'es';
  const text = (en: string, spanish: string) => es ? spanish : en;
  const { products: liveProducts, mode, error, canManage, createProduct, updateProduct, reload } = useWorkspaceProducts();
  const products = mode === 'demo' ? demoProducts : liveProducts;
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<WorkspaceProduct | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [formError, setFormError] = useState('');

  const kindLabel = (kind: ProductKind) => ({ website: text('Website', 'Sitio web'), mobile_app: text('Mobile app', 'Aplicación móvil'), game: text('Game', 'Videojuego'), service: text('Service / SaaS', 'Servicio / SaaS'), other: text('Other', 'Otro') })[kind];
  const kindIcon = (kind: ProductKind) => kind === 'website' ? Globe2 : kind === 'mobile_app' ? Smartphone : kind === 'game' ? Sparkles : Boxes;

  function openEditor(product?: WorkspaceProduct) {
    setEditing(product ?? null); setFormError(''); setSaved(false); setShowForm(true);
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const data = new FormData(formElement);
    const name = String(data.get('name') || '').trim();
    const kind = String(data.get('kind') || 'other') as ProductKind;
    setSaving(true); setFormError('');
    try {
      if (editing) await updateProduct(editing.id, name, kind);
      else await createProduct(name, kind);
      setSaved(true);
      setTimeout(() => { setShowForm(false); setSaved(false); setEditing(null); }, 700);
    } catch (cause) {
      setFormError(cause instanceof Error ? cause.message : text('The product could not be saved.', 'No se pudo guardar el producto.'));
    } finally { setSaving(false); }
  }

  return <>
    <div className={`crm-source-banner source-${mode}`}><span>{mode === 'loading' ? <LoaderCircle className="spin" size={16} /> : <Boxes size={16} />}</span><div><strong>{mode === 'live' ? text('Live product catalog', 'Catálogo de productos conectado') : mode === 'loading' ? text('Loading products…', 'Cargando productos…') : mode === 'error' ? text('Catalog unavailable', 'Catálogo no disponible') : text('Product catalog preview', 'Vista previa del catálogo')}</strong><small>{mode === 'live' ? text('These products define reporting, attribution and lead ownership scopes.', 'Estos productos definen los alcances de reportes, atribución y prospectos.') : mode === 'error' ? error : text('Connect Supabase to manage real products.', 'Conecta Supabase para administrar productos reales.')}</small></div>{mode === 'error' && <button onClick={() => void reload()}><RefreshCw size={13} /> {text('Retry', 'Reintentar')}</button>}</div>
    <div className="catalog-toolbar"><div><strong>{products.length} {text('products', 'productos')}</strong><span>{text('One workspace can market many websites, apps, games and services independently.', 'Un espacio puede promocionar varios sitios, aplicaciones, juegos y servicios por separado.')}</span></div><button className="button button-primary" disabled={mode !== 'live' || !canManage} onClick={() => openEditor()}><Plus size={15} /> {text('Add product', 'Añadir producto')}</button></div>
    <div className="product-catalog-grid">{products.map(product => { const Icon = kindIcon(product.kind); return <article className="product-catalog-card" key={product.id}><span className="product-kind-icon"><Icon size={18} /></span><div><small>{kindLabel(product.kind)}</small><h3>{product.name}</h3><p>{text('Separate leads, campaigns, analytics and integrations for this product.', 'Separa prospectos, campañas, analítica e integraciones para este producto.')}</p></div><button disabled={mode !== 'live' || !canManage} onClick={() => openEditor(product)}><Pencil size={13} /> {text('Edit', 'Editar')}</button></article> })}</div>
    {mode === 'live' && products.length === 0 && <div className="catalog-empty"><Boxes size={25} /><strong>{text('Build your product catalog', 'Crea tu catálogo de productos')}</strong><span>{text('Add the first product to unlock product-specific pipelines and reporting.', 'Añade el primer producto para activar embudos y reportes individuales.')}</span></div>}
    {!canManage && mode === 'live' && <div className="registry-warning"><Boxes size={18} /><div><strong>{text('Viewer access', 'Acceso de consulta')}</strong><span>{text('Only workspace owners and administrators can change the product catalog.', 'Solo propietarios y administradores pueden modificar el catálogo.')}</span></div></div>}

    {showForm && <div className="modal-backdrop" role="presentation" onMouseDown={() => setShowForm(false)}><form className="lead-modal" onMouseDown={event => event.stopPropagation()} onSubmit={submit}><div className="modal-head"><div><span>{editing ? text('Edit scope', 'Editar alcance') : text('New reporting scope', 'Nuevo alcance')}</span><h3>{editing ? text('Edit product', 'Editar producto') : text('Add product', 'Añadir producto')}</h3></div><button type="button" aria-label={text('Close form', 'Cerrar formulario')} onClick={() => setShowForm(false)}><X size={18} /></button></div><label>{text('Product name', 'Nombre del producto')}<input name="name" required defaultValue={editing?.name} placeholder="Organify" /></label><label>{text('Product type', 'Tipo de producto')}<select name="kind" defaultValue={editing?.kind ?? 'website'}><option value="website">{text('Website', 'Sitio web')}</option><option value="mobile_app">{text('Mobile app', 'Aplicación móvil')}</option><option value="game">{text('Game', 'Videojuego')}</option><option value="service">{text('Service / SaaS', 'Servicio / SaaS')}</option><option value="other">{text('Other', 'Otro')}</option></select></label>{formError && <div className="auth-error">{formError}</div>}<button className="button button-primary" disabled={saving}>{saved ? <><CheckCircle2 size={15} /> {text('Saved', 'Guardado')}</> : saving ? <><LoaderCircle className="spin" size={15} /> {text('Saving…', 'Guardando…')}</> : <><Save size={15} /> {text('Save product', 'Guardar producto')}</>}</button></form></div>}
  </>;
}
