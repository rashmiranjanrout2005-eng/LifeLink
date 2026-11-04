import { useEffect, useState } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import api from '../../services/api';

export default function ManageDonors() {
  const [donors, setDonors] = useState([]);
  const [state, setState] = useState('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    let active = true;
    api.get('/donors')
      .then(({ data }) => {
        if (active) {
          setDonors(data.data || []);
          setState('ready');
          setMessage(data.demo ? 'Sample donor listings are shown in demo mode.' : '');
        }
      })
      .catch((error) => {
        if (active) {
          setMessage(error.response?.data?.message || 'Unable to load donor records.');
          setState('error');
        }
      });
    return () => { active = false; };
  }, []);

  return (
    <AdminLayout>
      <div className="panel-header"><div><span className="eyebrow section-eyebrow">COMMUNITY</span><h1>Donor directory</h1></div></div>
      {message && <div className={`search-message ${state === 'error' ? 'search-error' : ''}`}>{message}</div>}
      {state === 'loading' && <div className="loader" aria-label="Loading donors" />}
      {state === 'ready' && donors.length === 0 && <div className="dashboard-notice"><p>No donors have opted in to appear in the directory yet.</p></div>}
      {state === 'ready' && donors.length > 0 && <div className="table-scroll"><table className="data-table admin-data-table"><thead><tr><th>Blood group</th><th>City</th><th>District</th><th>Availability</th></tr></thead><tbody>
        {donors.map((donor) => <tr key={donor.id}><td><span className="group-tag">{donor.blood_group}</span></td><td>{donor.city || '—'}</td><td>{donor.district || '—'}</td><td><span className="donor-available"><i /> {donor.availability_status}</span></td></tr>)}
      </tbody></table></div>}
    </AdminLayout>
  );
}
