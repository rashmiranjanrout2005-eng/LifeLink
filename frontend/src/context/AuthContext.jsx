import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';

const AuthContext = createContext(null);
const isSupabaseConfigured = Boolean(
  import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY
);
const loadSupabase = () => import('../services/supabase').then(({ supabase }) => supabase);

function hasStoredAuthSession() {
  if (!isSupabaseConfigured) return false;
  const projectRef = new URL(import.meta.env.VITE_SUPABASE_URL).hostname.split('.')[0];
  try {
    return window.localStorage.getItem(`sb-${projectRef}-auth-token`) !== null;
  } catch (error) {
    console.error('Unable to check for a saved authentication session:', error.message);
    return true;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  const authInitializationRef = useRef(null);
  const subscriptionRef = useRef(null);
  const mountedRef = useRef(false);

  const initializeAuth = () => {
    if (!authInitializationRef.current) {
      authInitializationRef.current = loadSupabase().then(async (supabase) => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
          setSession(nextSession);
          setUser(nextSession?.user ?? null);
          setLoading(false);
        });
        subscriptionRef.current = subscription;

        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        if (mountedRef.current) {
          setSession(data.session);
          setUser(data.session?.user ?? null);
          setLoading(false);
        }
        return supabase;
      }).catch((error) => {
        authInitializationRef.current = null;
        throw error;
      });
    }
    return authInitializationRef.current;
  };

  useEffect(() => {
    mountedRef.current = true;
    if (window.location.pathname === '/auth/callback' || hasStoredAuthSession()) {
      initializeAuth().catch((error) => {
        console.error('Unable to initialize authentication:', error.message);
        if (mountedRef.current) setLoading(false);
      });
    } else {
      setLoading(false);
    }

    return () => {
      mountedRef.current = false;
      subscriptionRef.current?.unsubscribe();
      subscriptionRef.current = null;
    };
  }, []);

  const signIn = async ({ email, password }) => {
    if (!isSupabaseConfigured) throw new Error('Add your Supabase URL and anon key to frontend/.env to enable accounts.');
    const supabase = await initializeAuth();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  };

  const signUp = async ({ email, password, full_name, role }) => {
    if (!isSupabaseConfigured) throw new Error('Add your Supabase URL and anon key to frontend/.env to enable accounts.');
    const supabase = await initializeAuth();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name, role } }
    });
    if (error) throw error;
    return data;
  };

  const signInWithGoogle = async () => {
    if (!isSupabaseConfigured) throw new Error('Configure Supabase first, then enable Google under Authentication → Providers.');
    const supabase = await initializeAuth();
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: new URL('/auth/callback', window.location.origin).toString(),
        queryParams: { prompt: 'select_account' }
      }
    });
    if (error) throw error;
    return data;
  };

  const signOut = async () => {
    const supabase = await initializeAuth();
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const value = useMemo(
    () => ({ user, session, loading, signIn, signUp, signInWithGoogle, signOut }),
    [user, session, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}
