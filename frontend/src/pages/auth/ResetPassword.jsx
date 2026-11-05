import { useEffect, useState } from 'react';
import { confirmPasswordReset, verifyPasswordResetCode } from 'firebase/auth';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import { auth } from '../../firebase';

export default function ResetPassword() {
  const [oobCode, setOobCode] = useState('');
  const [validating, setValidating] = useState(true);
  const [valid, setValid] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get('oobCode');
    if (!code) {
      setValidating(false);
      return;
    }
    setOobCode(code);
    verifyPasswordResetCode(auth, code)
      .then(() => setValid(true))
      .catch((error) => toast.error(error.message || 'This password reset link is invalid or expired.'))
      .finally(() => setValidating(false));
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const password = form.password.value;
    if (password !== form.confirmPassword.value) {
      toast.error('The passwords do not match.');
      return;
    }
    setBusy(true);
    try {
      await confirmPasswordReset(auth, oobCode, password);
      setValid(false);
      toast.success('Password updated. You can now sign in.');
    } catch (error) {
      toast.error(error.message || 'Unable to update your password.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="section container">
        <form className="form-card" onSubmit={handleSubmit}>
          <h2>Reset Password</h2>
          {validating ? <p>Checking your reset link…</p> : valid ? (
            <>
              <div className="field-group"><label className="field-label" htmlFor="password">New Password</label><input className="input" id="password" name="password" type="password" autoComplete="new-password" minLength={8} required /></div>
              <div className="field-group"><label className="field-label" htmlFor="confirmPassword">Confirm Password</label><input className="input" id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" minLength={8} required /></div>
              <button className="btn btn-primary" type="submit" disabled={busy}>{busy ? 'Updating…' : 'Update Password'}</button>
            </>
          ) : <p>The reset link is invalid or expired. <Link to="/forgot-password">Request another link</Link>.</p>}
        </form>
      </main>
      <Footer />
    </>
  );
}
