import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';

export default function ForgotPassword() {
  return (
    <>
      <Navbar />
      <main className="section container">
        <form className="form-card">
          <h2>Forgot Password</h2>
          <div className="field-group"><label className="field-label">Email</label><input className="input" type="email" placeholder="you@example.com" /></div>
          <button className="btn btn-primary" type="submit">Send Reset Link</button>
        </form>
      </main>
      <Footer />
    </>
  );
}
