import { useCallback, useEffect, useState } from 'react';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

export type LeadStage = 'new_inquiry' | 'discovery' | 'qualified' | 'proposal' | 'won' | 'lost';

export type LeadRecord = {
  id: string;
  name: string;
  email: string | null;
  company: string | null;
  service: string | null;
  stage: LeadStage;
  source: string | null;
  estimated_value_min: number | null;
  estimated_value_max: number | null;
  product_id: string | null;
  created_at: string;
};

export type LeadDraft = {
  name: string;
  email: string;
  company: string;
  service: string;
  source: string;
  estimatedValueMin: number | null;
  estimatedValueMax: number | null;
};

type LeadMode = 'demo' | 'loading' | 'live' | 'error';

const productAliases: Record<string, string[]> = {
  'ClubGamerZone website': ['clubgamerzone website', 'clubgamerzone'],
  Organify: ['organify'],
  'CV Enhancer': ['cv enhancer', 'currículo claro', 'curriculo claro'],
  'Games portfolio': ['games portfolio', 'games', 'game portfolio'],
};

const normalize = (value: string) => value.trim().toLocaleLowerCase();

export function useWorkspaceLeads(productKey: string) {
  const [records, setRecords] = useState<LeadRecord[]>([]);
  const [mode, setMode] = useState<LeadMode>(isSupabaseConfigured ? 'loading' : 'demo');
  const [error, setError] = useState('');
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  const [productId, setProductId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!supabase) {
      setMode('demo');
      return;
    }

    setMode('loading');
    setError('');
    const membership = await supabase.from('workspace_members').select('workspace_id').limit(1).single();
    if (membership.error || !membership.data?.workspace_id) {
      setError(membership.error?.message || 'No workspace membership was found.');
      setMode('error');
      return;
    }

    const selectedWorkspaceId = membership.data.workspace_id as string;
    setWorkspaceId(selectedWorkspaceId);

    let selectedProductId: string | null = null;
    if (productKey !== 'All products') {
      const products = await supabase.from('products').select('id,name').eq('workspace_id', selectedWorkspaceId);
      if (products.error) {
        setError(products.error.message);
        setMode('error');
        return;
      }
      const aliases = productAliases[productKey] ?? [normalize(productKey)];
      const match = products.data?.find(item => aliases.includes(normalize(item.name)));
      selectedProductId = match?.id ?? null;
      setProductId(selectedProductId);
      if (!selectedProductId) {
        setRecords([]);
        setMode('live');
        return;
      }
    } else {
      setProductId(null);
    }

    let request = supabase
      .from('leads')
      .select('id,name,email,company,service,stage,source,estimated_value_min,estimated_value_max,product_id,created_at')
      .eq('workspace_id', selectedWorkspaceId)
      .order('created_at', { ascending: false });
    if (selectedProductId) request = request.eq('product_id', selectedProductId);

    const result = await request;
    if (result.error) {
      setError(result.error.message);
      setMode('error');
      return;
    }
    setRecords((result.data ?? []) as LeadRecord[]);
    setMode('live');
  }, [productKey]);

  useEffect(() => { void load(); }, [load]);

  async function createLead(draft: LeadDraft) {
    if (!supabase || !workspaceId) throw new Error('The live CRM workspace is not ready.');
    const session = await supabase.auth.getSession();
    if (!session.data.session) throw new Error('Your session expired. Sign in again.');

    const result = await supabase.from('leads').insert({
      workspace_id: workspaceId,
      product_id: productId,
      name: draft.name.trim(),
      email: draft.email.trim(),
      company: draft.company.trim() || null,
      service: draft.service,
      stage: 'new_inquiry',
      source: draft.source,
      estimated_value_min: draft.estimatedValueMin,
      estimated_value_max: draft.estimatedValueMax,
      created_by: session.data.session.user.id,
    }).select('id,name,email,company,service,stage,source,estimated_value_min,estimated_value_max,product_id,created_at').single();

    if (result.error) throw result.error;
    setRecords(current => [result.data as LeadRecord, ...current]);
    return result.data as LeadRecord;
  }

  async function updateStage(id: string, stage: LeadStage) {
    if (!supabase) throw new Error('Supabase is not configured.');
    const previous = records;
    setRecords(current => current.map(record => record.id === id ? { ...record, stage } : record));
    const result = await supabase.from('leads').update({ stage, updated_at: new Date().toISOString() }).eq('id', id);
    if (result.error) {
      setRecords(previous);
      throw result.error;
    }
  }

  return { records, mode, error, createLead, updateStage, reload: load, selectedProductIsConfigured: productKey === 'All products' || Boolean(productId) };
}
