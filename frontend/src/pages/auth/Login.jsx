import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowRight, HeartPulse, Mail, ShieldCheck } from 'lucide-react';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import GoogleMark from '../../components/common/GoogleMark';
import { useAuth } from '../../context/AuthContext';
import { getPostAuthPath, saveAuthRedirect } from '../../utils/authRedirect';

export default function Login() {
  const { signIn, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [busy, setBusy] = useState(false);
  const [googleBusy, setGoogleBusy] = useState(false);
  const requestedPath = location.state?.from;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setBusy(true);
    try {
      const { user } = await signIn({
        email: event.currentTarget.email.value.trim(),
        password: event.currentTarget.password.value
      });
      toast.success('Welcome back.');
      navigate(getPostAuthPath(user, requestedPath), { replace: true });
    } catch (error) {
      toast.error(error.message || 'Unable to sign in.');
    } finally {
      setBusy(false);
    }
  };

  const handleGoogle = async () => {
    setGoogleBusy(true);
    try {
      saveAuthRedirect(requestedPath);
      await signInWithGoogle();
    } catch (error) {
      saveAuthRedirect(null);
      toast.error(error.message || 'Google sign-in is unavailable.');
      setGoogleBusy(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="auth-page">
        <div className="auth-orb auth-orb-one" />
        <div className="auth-orb auth-orb-two" />
        <section className="auth-layout container">
          <div className="auth-story">
            <span className="eyebrow"><HeartPulse size={15} /> A little time. A lifetime of impact.</span>
            <h1>Every drop has a <span>destination.</span></h1>
            <p>Donor search and blood availability are open to everyone. Sign in to manage your donor profile or submit and track a blood request.</p>
            <div className="auth-trust"><ShieldCheck size={18} /> Your account is protected with secure authentication</div>
          </div>
          <form className="auth-card" onSubmit={handleSubmit}>
            <div className="auth-card-heading">
              <span className="auth-icon"><HeartPulse size={20} /></span>
              <p className="eyebrow">WELCOME BACK</p>
              <h2>Sign in to your account</h2>
              <p>Continue to your donor profile or blood-request workflow.</p>
            </div>
            <button className="google-button" type="button" onClick={handleGoogle} disabled={googleBusy}>
              <GoogleMark /> {googleBusy ? 'Connecting to Google…' : 'Continue with Google'}
            </button>
            <div className="auth-divider"><span>or sign in with email</span></div>
            <div className="field-group">
              <label className="field-label" htmlFor="email">Email address</label>
              <div className="auth-input-wrap"><Mail size={17} /><input className="input" id="email" name="email" type="email" autoComplete="email" placeholder="you@example.com" required /></div>
            </div>
            <div className="field-group">
              <div className="auth-label-row"><label className="field-label" htmlFor="password">Password</label><Link to="/forgot-password">Forgot password?</Link></div>
              <input className="input" id="password" name="password" type="password" autoComplete="current-password" placeholder="Enter your password" required minLength={6} />
            </div>
            <button className="btn btn-primary auth-submit" type="submit" disabled={busy}>{busy ? 'Signing in…' : <>Sign in <ArrowRight size={17} /></>}</button>
            <p className="auth-switch">New to LifeLink? <Link to="/register">Create an account</Link></p>
            <p className="auth-note">Google sign-in requires the Google provider to be enabled in your Supabase project.</p>
          </form>
        </section>
      </main>
      <Footer />
    </>
  );
}
