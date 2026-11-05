import { useState } from 'react';
import { sendPasswordResetEmail } from 'firebase/auth';
import toast from 'react-hot-toast';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import { auth } from '../../firebase';

export default function ForgotPassword() {
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    setBusy(true);
    try {
      await sendPasswordResetEmail(auth, form.email.value.trim(), {
        url: `${window.location.origin}/login`
      });
      toast.success('Password reset email sent.');
      form.reset();
    } catch (error) {
      toast.error(error.message || 'Unable to send the password reset email.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="section container">
        <form className="form-card" onSubmit={handleSubmit}>
          <h2>Forgot Password</h2>
          <div className="field-group"><label className="field-label" htmlFor="email">Email</label><input className="input" id="email" name="email" type="email" autoComplete="email" placeholder="you@example.com" required /></div>
          <button className="btn btn-primary" type="submit" disabled={busy}>{busy ? 'Sending…' : 'Send Reset Link'}</button>
        </form>
      </main>
      <Footer />
    </>
  );
}
