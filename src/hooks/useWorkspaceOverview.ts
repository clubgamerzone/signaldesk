import { useCallback, useEffect, useState } from 'react';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import type { LeadStage } from './useWorkspaceLeads';

export type OverviewLead = {
  id: string;
  name: string;
  company: string | null;
  service: string | null;
  stage: LeadStage;
  source: string | null;
  estimated_value_min: number | null;
  estimated_value_max: number | null;
  created_at: string;
};

type OverviewMode = 'demo' | 'loading' | 'live' | 'error';

function periodStart(range: string) {
  const start = new Date();
  if (range === 'Last 7 days') start.setDate(start.getDate() - 7);
  else if (range === 'Last 30 days') start.setDate(start.getDate() - 30);
  else if (range === 'This quarter') start.setMonth(Math.floor(start.getMonth() / 3) * 3, 1);
  else start.setMonth(0, 1);
  start.setHours(0, 0, 0, 0);
  return start.toISOString();
}

export function useWorkspaceOverview(productName: string, range: string) {
  const [records, setRecords] = useState<OverviewLead[]>([]);
  const [mode, setMode] = useState<OverviewMode>(isSupabaseConfigured ? 'loading' : 'demo');
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    if (!supabase) { setMode('demo'); return; }
    setMode('loading'); setError('');

    const membership = await supabase.from('workspace_members').select('workspace_id').limit(1).single();
    if (membership.error || !membership.data?.workspace_id) {
      setError(membership.error?.message || 'No workspace membership was found.');
      setMode('error');
      return;
    }

    const workspaceId = String(membership.data.workspace_id);
    let productId: string | null = null;
    if (productName !== 'All products') {
      const products = await supabase.from('products').select('id,name').eq('workspace_id', workspaceId);
      if (products.error) { setError(products.error.message); setMode('error'); return; }
      productId = products.data?.find(item => item.name.trim().toLocaleLowerCase() === productName.trim().toLocaleLowerCase())?.id ?? null;
      if (!productId) { setRecords([]); setMode('live'); return; }
    }

    let request = supabase
      .from('leads')
      .select('id,name,company,service,stage,source,estimated_value_min,estimated_value_max,created_at')
      .eq('workspace_id', workspaceId)
      .gte('created_at', periodStart(range))
      .order('created_at', { ascending: false });
    if (productId) request = request.eq('product_id', productId);

    const result = await request;
    if (result.error) { setError(result.error.message); setMode('error'); return; }
    setRecords((result.data ?? []) as OverviewLead[]);
    setMode('live');
  }, [productName, range]);

  useEffect(() => { void load(); }, [load]);
  return { records, mode, error, reload: load };
}
