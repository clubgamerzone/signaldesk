import { useCallback, useEffect, useState } from 'react';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

export type ProductKind = 'website' | 'mobile_app' | 'game' | 'service' | 'other';
export type WorkspaceProduct = { id: string; name: string; kind: ProductKind; created_at: string };
type CatalogMode = 'demo' | 'loading' | 'live' | 'error';

export function useWorkspaceProducts() {
  const [products, setProducts] = useState<WorkspaceProduct[]>([]);
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  const [canManage, setCanManage] = useState(false);
  const [mode, setMode] = useState<CatalogMode>(isSupabaseConfigured ? 'loading' : 'demo');
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    if (!supabase) { setMode('demo'); return; }
    setMode('loading'); setError('');
    const membership = await supabase.from('workspace_members').select('workspace_id,role').limit(1).single();
    if (membership.error || !membership.data?.workspace_id) {
      setError(membership.error?.message || 'No workspace membership was found.');
      setMode('error');
      return;
    }

    const currentWorkspaceId = membership.data.workspace_id as string;
    setWorkspaceId(currentWorkspaceId);
    setCanManage(['owner', 'admin'].includes(String(membership.data.role)));
    const result = await supabase.from('products').select('id,name,kind,created_at').eq('workspace_id', currentWorkspaceId).order('created_at');
    if (result.error) { setError(result.error.message); setMode('error'); return; }
    setProducts((result.data ?? []) as WorkspaceProduct[]);
    setMode('live');
  }, []);

  useEffect(() => { void load(); }, [load]);

  async function createProduct(name: string, kind: ProductKind) {
    if (!supabase || !workspaceId || !canManage) throw new Error('Owner or administrator access is required.');
    const result = await supabase.from('products').insert({ workspace_id: workspaceId, name: name.trim(), kind }).select('id,name,kind,created_at').single();
    if (result.error) throw result.error;
    setProducts(current => [...current, result.data as WorkspaceProduct]);
  }

  async function updateProduct(id: string, name: string, kind: ProductKind) {
    if (!supabase || !canManage) throw new Error('Owner or administrator access is required.');
    const result = await supabase.from('products').update({ name: name.trim(), kind }).eq('id', id).select('id,name,kind,created_at').single();
    if (result.error) throw result.error;
    setProducts(current => current.map(product => product.id === id ? result.data as WorkspaceProduct : product));
  }

  return { products, mode, error, canManage, createProduct, updateProduct, reload: load };
}
