import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';

export default function About() {
  return (
    <>
      <Navbar />
      <main className="section container">
        <h1>About Our Mission</h1>
        <p>Our blood bank network is built to create timely access to safe blood supply for hospitals, donors, and patients.</p>
        <div className="card-grid">
          <div className="info-card"><h3>Mission</h3><p>Deliver safe and timely blood resources with transparency and accountability.</p></div>
          <div className="info-card"><h3>Vision</h3><p>Make blood donation accessible and coordinated across communities.</p></div>
          <div className="info-card"><h3>Importance</h3><p>Blood donation saves lives during emergencies, surgeries, and treatment of chronic conditions.</p></div>
        </div>
      </main>
      <Footer />
    </>
  );
}
