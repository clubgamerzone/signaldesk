import { FormEvent, ReactNode, useEffect, useState } from 'react';
import { ArrowRight, LockKeyhole, Mail, Sparkles } from 'lucide-react';
import type { Session } from '@supabase/supabase-js';
import { isSupabaseConfigured, supabase } from './lib/supabase';

export default function AuthGate({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setLoading(false); });
    const { data } = supabase.auth.onAuthStateChange((event, nextSession) => {
      setSession(nextSession);
      if (event === 'PASSWORD_RECOVERY') setIsPasswordRecovery(true);
    });
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

  async function updatePassword(event: FormEvent) {
    event.preventDefault();
    if (!supabase) return;
    if (newPassword.length < 8) {
      setError('Use at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('The passwords do not match.');
      return;
    }

    setLoading(true); setError('');
    const result = await supabase.auth.updateUser({ password: newPassword });
    if (result.error) {
      setError(result.error.message);
    } else {
      setIsPasswordRecovery(false);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    setLoading(false);
  }

  if (!isSupabaseConfigured) return <>{children}</>;
  if (loading && !session) return <div className="auth-screen"><div className="auth-loading"><Sparkles size={22} /> Preparing your workspace…</div></div>;
  if (session && isPasswordRecovery) return <main className="auth-screen"><form className="auth-card" onSubmit={updatePassword}><span className="auth-logo"><Sparkles size={19} /></span><p>SignalDesk</p><h1>Create your password<span>.</span></h1><small>Your invitation was verified. Choose the password you will use to sign in.</small><label><span>New password</span><div><LockKeyhole size={15} /><input required minLength={8} type="password" value={newPassword} onChange={event => setNewPassword(event.target.value)} autoComplete="new-password" /></div></label><label><span>Confirm password</span><div><LockKeyhole size={15} /><input required minLength={8} type="password" value={confirmPassword} onChange={event => setConfirmPassword(event.target.value)} autoComplete="new-password" /></div></label>{error && <div className="auth-error">{error}</div>}<button className="button button-primary" disabled={loading}>{loading ? 'Saving…' : <>Save password <ArrowRight size={15} /></>}</button><footer>Your password is sent directly to Supabase and is never stored by SignalDesk.</footer></form></main>;
  if (session) return <>{children}</>;

  return <main className="auth-screen"><form className="auth-card" onSubmit={signIn}><span className="auth-logo"><Sparkles size={19} /></span><p>SignalDesk</p><h1>Welcome back<span>.</span></h1><small>Sign in to your private marketing workspace.</small><label><span>Email</span><div><Mail size={15} /><input required type="email" value={email} onChange={event => setEmail(event.target.value)} autoComplete="email" /></div></label><label><span>Password</span><div><LockKeyhole size={15} /><input required type="password" value={password} onChange={event => setPassword(event.target.value)} autoComplete="current-password" /></div></label>{error && <div className="auth-error">{error}</div>}<button className="button button-primary" disabled={loading}>{loading ? 'Signing in…' : <>Sign in <ArrowRight size={15} /></>}</button><footer>Access is limited to approved workspace members.</footer></form></main>;
}
