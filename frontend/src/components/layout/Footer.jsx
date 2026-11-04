import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div>
          <h4>LifeLink</h4>
          <p>Bringing blood donors, hospitals, and communities closer when it matters.</p>
        </div>
        <div>
          <h5>Quick Links</h5>
          <ul>
            <li><Link to="/about">About</Link></li>
            <li><Link to="/find-donors">Find Donors</Link></li>
            <li><Link to="/contact">Contact</Link></li>
          </ul>
        </div>
        <div>
          <h5>Need blood now?</h5>
          <ul>
            <li>Contact your hospital or local blood bank directly for urgent help.</li>
            <li><Link to="/hospital/request-blood">Submit a request</Link></li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
