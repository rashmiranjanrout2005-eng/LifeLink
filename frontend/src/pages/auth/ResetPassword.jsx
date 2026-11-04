import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';

export default function ResetPassword() {
  return (
    <>
      <Navbar />
      <main className="section container">
        <form className="form-card">
          <h2>Reset Password</h2>
          <div className="field-group"><label className="field-label">New Password</label><input className="input" type="password" /></div>
          <div className="field-group"><label className="field-label">Confirm Password</label><input className="input" type="password" /></div>
          <button className="btn btn-primary" type="submit">Update Password</button>
        </form>
      </main>
      <Footer />
    </>
  );
}
