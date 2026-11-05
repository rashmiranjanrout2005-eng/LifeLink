import { useEffect, useState } from 'react';
import { Activity, Droplets } from 'lucide-react';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import api from '../../services/api';

const groups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function BloodAvailability() {
  const [stock, setStock] = useState([]);
  const [state, setState] = useState('loading');

  useEffect(() => {
    let active = true;
    api.get('/inventory/availability')
      .then(({ data }) => {
        if (active) {
          setStock(Array.isArray(data?.data) ? data.data : []);
          setState(data?.demo ? 'demo' : 'ready');
        }
      })
      .catch(() => { if (active) setState('error'); });
    return () => { active = false; };
  }, []);

  return (
    <>
      <Navbar />
      <main className="search-page">
        <section className="availability-hero">
          <div className="container">
            <span className="eyebrow"><Activity size={14} /> BLOOD STOCK</span>
            <h1>Know what's available.<br /><span>Be ready to help.</span></h1>
            <p>Current availability is based on approved, unexpired blood units in the system.</p>
          </div>
        </section>
        <section className="section availability-section">
          <div className="container">
            <div className="availability-grid availability-grid-large">
              {groups.map((group, index) => {
                const units = stock.find((item) => item.bloodGroup === group)?.units ?? 0;
                return (
                  <article className="blood-card" key={group} style={{ '--card-index': index }}>
                    <div className="blood-card-top"><span className="blood-drop"><Droplets size={18} /></span><span className={`stock-status ${state === 'ready' ? 'is-live' : ''}`}><i />{state === 'loading' ? 'Loading' : state === 'error' ? 'Unavailable' : state === 'demo' ? 'Demo data' : 'Live stock'}</span></div>
                    <span className="blood-type">{group}</span>
                    <div className="blood-stock">{state === 'ready' || state === 'demo' ? units : '—'}<span>units available</span></div>
                    <div className="stock-track"><span style={{ width: `${Math.min(units * 4, 100)}%` }} /></div>
                  </article>
                );
              })}
            </div>
            {state === 'error' && <p className="availability-note">We couldn't reach the inventory service. Please try again later.</p>}
            {state === 'demo' && <p className="availability-note">These are sample demo numbers, not actual blood bank stock. Configure Firebase to load live inventory.</p>}
            <p className="stock-disclaimer">Stock changes as donations are screened, reserved, and issued. Confirm availability directly with the blood bank before travelling.</p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
