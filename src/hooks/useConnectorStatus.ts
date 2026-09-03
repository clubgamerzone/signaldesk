import { useCallback, useEffect, useState } from 'react';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

export type ConnectorStatus = { provider: string; configured: boolean; missing: string[] };
type ConnectorMode = 'idle' | 'loading' | 'live' | 'error';

export function useConnectorStatus(enabled: boolean) {
  const [connectors, setConnectors] = useState<ConnectorStatus[]>([]);
  const [mode, setMode] = useState<ConnectorMode>('idle');
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    if (!enabled) return;
    if (!supabase || !isSupabaseConfigured) { setMode('error'); setError('Supabase is not configured.'); return; }
    setMode('loading'); setError('');
    try {
      const sessionResult = await supabase.auth.getSession();
      const session = sessionResult.data.session;
      if (!session) throw new Error('Your session expired. Sign in again.');
      const membership = await supabase.from('workspace_members').select('workspace_id').limit(1).single();
      if (membership.error || !membership.data?.workspace_id) throw new Error(membership.error?.message || 'No workspace membership was found.');
      const response = await fetch(`/api/connectors-status?workspace_id=${encodeURIComponent(String(membership.data.workspace_id))}`, { headers: { authorization: `Bearer ${session.access_token}` } });
      if (!response.headers.get('content-type')?.includes('application/json')) throw new Error('NETLIFY_RUNTIME_REQUIRED');
      const data = await response.json() as { connectors?: ConnectorStatus[]; error?: string };
      if (!response.ok || !data.connectors) throw new Error(data.error || 'Connector status could not be loaded.');
      setConnectors(data.connectors);
      setMode('live');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Connector status could not be loaded.');
      setMode('error');
    }
  }, [enabled]);

  useEffect(() => { void load(); }, [load]);
  return { connectors, mode, error, reload: load };
}
