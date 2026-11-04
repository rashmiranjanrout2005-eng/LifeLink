import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowRight, HeartPulse, Mail, ShieldCheck } from 'lucide-react';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import GoogleMark from '../../components/common/GoogleMark';
import { useAuth } from '../../context/AuthContext';
import { getPostAuthPath, saveAuthRedirect } from '../../utils/authRedirect';

export default function Register() {
  const { signUp, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [busy, setBusy] = useState(false);
  const [googleBusy, setGoogleBusy] = useState(false);
  const requestedPath = location.state?.from;
  const requestedRole = location.state?.role;

  const handleSubmit = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    setBusy(true);
    try {
      const { session } = await signUp({
        full_name: form.full_name.value.trim(),
        email: form.email.value.trim(),
        role: form.role.value,
        password: form.password.value
      });
      if (!session) {
        toast.success('Account created. Check your email to verify it, then sign in.');
        navigate('/login', { state: location.state, replace: true });
      } else {
        toast.success('Your account is ready.');
        navigate(getPostAuthPath(session.user, requestedPath), { replace: true });
      }
    } catch (error) {
      toast.error(error.message || 'Unable to create your account.');
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
        <section className="auth-layout container auth-layout-register">
          <div className="auth-story">
            <span className="eyebrow"><HeartPulse size={15} /> Join the network that shows up</span>
            <h1>Be someone's <span>reason to hope.</span></h1>
            <p>Browsing is public. Create an account to register as a donor, submit and track requests, or manage hospital activity.</p>
            <div className="auth-trust"><ShieldCheck size={18} /> Your details stay protected and in your control</div>
          </div>
          <form className="auth-card" onSubmit={handleSubmit}>
            <div className="auth-card-heading">
              <span className="auth-icon"><HeartPulse size={20} /></span>
              <p className="eyebrow">GET STARTED</p>
              <h2>Create your account</h2>
              <p>Choose the account type that matches how you will use LifeLink.</p>
            </div>
            <button className="google-button" type="button" onClick={handleGoogle} disabled={googleBusy}><GoogleMark /> {googleBusy ? 'Connecting to Google…' : 'Continue with Google'}</button>
            <div className="auth-divider"><span>or create an account with email</span></div>
            <div className="field-group">
              <label className="field-label" htmlFor="full_name">Full name</label>
              <input className="input" id="full_name" name="full_name" autoComplete="name" placeholder="Your full name" required maxLength={100} />
            </div>
            <div className="field-group">
              <label className="field-label" htmlFor="email">Email address</label>
              <div className="auth-input-wrap"><Mail size={17} /><input className="input" id="email" name="email" type="email" autoComplete="email" placeholder="you@example.com" required /></div>
            </div>
            <div className="field-group">
              <label className="field-label" htmlFor="role">I am registering as</label>
              <select className="input" id="role" name="role" defaultValue={requestedRole || 'donor'}>
                <option value="donor">Blood donor</option>
                <option value="hospital">Hospital / blood bank</option>
                <option value="patient">Patient / family member</option>
              </select>
            </div>
            <div className="field-group">
              <label className="field-label" htmlFor="password">Create password</label>
              <input className="input" id="password" name="password" type="password" autoComplete="new-password" placeholder="At least 8 characters" required minLength={8} />
            </div>
            <button className="btn btn-primary auth-submit" type="submit" disabled={busy}>{busy ? 'Creating account…' : <>Create account <ArrowRight size={17} /></>}</button>
            <p className="auth-switch">Already registered? <Link to="/login">Sign in</Link></p>
            <p className="auth-note">By continuing, you agree to use this service responsibly. Google sign-in requires configuration in Supabase.</p>
          </form>
        </section>
      </main>
      <Footer />
    </>
  );
}
