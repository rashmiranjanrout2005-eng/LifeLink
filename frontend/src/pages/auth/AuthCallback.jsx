import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HeartPulse, ShieldCheck } from 'lucide-react';
import { consumeAuthRedirect } from '../../utils/authRedirect';

export default function AuthCallback() {
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let active = true;
    let completed = false;
    let timeoutId;
    const url = new URL(window.location.href);
    const providerError = url.searchParams.get('error_description') || url.searchParams.get('error');

    const showError = (message) => {
      if (!active) return;
      window.clearTimeout(timeoutId);
      setErrorMessage(message);
    };

    const completeSignIn = (session) => {
      if (!active || completed || !session) return;
      completed = true;
      window.clearTimeout(timeoutId);
      navigate(consumeAuthRedirect(session.user), { replace: true });
    };

    if (providerError) {
      showError(providerError);
      return () => { active = false; };
    }

    let subscription;
    import('../../services/supabase').then(({ supabase }) => {
      if (!active) return;
      const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN') completeSignIn(session);
      });
      subscription = authSubscription;

      supabase.auth.getSession().then(({ data, error }) => {
        if (!active) return;
        if (error) {
          showError(error.message);
        } else if (data.session) {
          completeSignIn(data.session);
        }
      }).catch((error) => {
        showError(error.message || 'Unable to complete Google sign-in.');
      });
    }).catch((error) => {
      showError(error.message || 'Unable to complete Google sign-in.');
    });

    timeoutId = window.setTimeout(() => {
      showError('Sign-in did not complete. Check that Google is enabled in Supabase and this callback URL is allowed.');
    }, 15000);

    return () => {
      active = false;
      window.clearTimeout(timeoutId);
      subscription?.unsubscribe();
    };
  }, [navigate]);

  return (
    <main className="auth-page auth-callback-page">
      <div className="auth-orb auth-orb-one" />
      <section className="auth-callback-card">
        <span className="auth-icon"><HeartPulse size={22} /></span>
        {errorMessage ? (
          <>
            <p className="eyebrow">SIGN-IN NEEDS ATTENTION</p>
            <h1>We couldn't finish signing you in.</h1>
            <p className="auth-callback-message">{errorMessage}</p>
            <Link className="btn btn-primary" to="/login">Back to sign in</Link>
            <p className="auth-note">Confirm the Google provider is enabled and <code>{window.location.origin}/auth/callback</code> is in Supabase's allowed redirect URLs.</p>
          </>
        ) : (
          <>
            <span className="callback-spinner" aria-hidden="true" />
            <p className="eyebrow">SECURE GOOGLE SIGN-IN</p>
            <h1>Connecting your account…</h1>
            <p className="auth-callback-message"><ShieldCheck size={16} /> Finishing authentication with Supabase.</p>
          </>
        )}
      </section>
    </main>
  );
}
