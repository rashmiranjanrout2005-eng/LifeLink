import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';

export default function Contact() {
  return (
    <>
      <Navbar />
      <main className="section container">
        <h1>Contact Us</h1>
        <div className="form-card">
          <div className="field-group"><label className="field-label">Name</label><input className="input" placeholder="Your name" /></div>
          <div className="field-group"><label className="field-label">Email</label><input className="input" type="email" placeholder="you@example.com" /></div>
          <div className="field-group"><label className="field-label">Message</label><textarea className="input" rows="5" placeholder="How can we help?" /></div>
          <button className="btn btn-primary">Send Message</button>
        </div>
      </main>
      <Footer />
    </>
  );
}
