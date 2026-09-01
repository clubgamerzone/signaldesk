import { FormEvent, ReactNode, useEffect, useState } from 'react';
import { ArrowRight, LockKeyhole, Mail, Sparkles } from 'lucide-react';
import type { Session } from '@supabase/supabase-js';
import { isSupabaseConfigured, supabase } from './lib/supabase';

export default function AuthGate({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setLoading(false); });
    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => setSession(nextSession));
    return () => data.subscription.unsubscribe();
  }, []);

  async function signIn(event: FormEvent) {
    event.preventDefault();
    if (!supabase) return;
    setLoading(true); setError('');
    const result = await supabase.auth.signInWithPassword({ email, password });
    if (result.error) setError(result.error.message);
    setLoading(false);
  }

  if (!isSupabaseConfigured) return <>{children}</>;
  if (loading && !session) return <div className="auth-screen"><div className="auth-loading"><Sparkles size={22} /> Preparing your workspace…</div></div>;
  if (session) return <>{children}</>;

  return <main className="auth-screen"><form className="auth-card" onSubmit={signIn}><span className="auth-logo"><Sparkles size={19} /></span><p>SignalDesk</p><h1>Welcome back<span>.</span></h1><small>Sign in to your private marketing workspace.</small><label><span>Email</span><div><Mail size={15} /><input required type="email" value={email} onChange={event => setEmail(event.target.value)} autoComplete="email" /></div></label><label><span>Password</span><div><LockKeyhole size={15} /><input required type="password" value={password} onChange={event => setPassword(event.target.value)} autoComplete="current-password" /></div></label>{error && <div className="auth-error">{error}</div>}<button className="button button-primary" disabled={loading}>{loading ? 'Signing in…' : <>Sign in <ArrowRight size={15} /></>}</button><footer>Access is limited to approved workspace members.</footer></form></main>;
}
