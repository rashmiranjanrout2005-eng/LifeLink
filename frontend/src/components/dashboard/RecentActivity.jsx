import { useEffect, useState } from 'react';
import api from '../../services/api';

export default function RecentActivity() {
  const [requests, setRequests] = useState([]);
  const [state, setState] = useState('loading');

  useEffect(() => {
    let active = true;
    api.get('/requests')
      .then(({ data }) => {
        if (active) {
          setRequests(Array.isArray(data?.data) ? data.data.slice(0, 5) : []);
          setState('ready');
        }
      })
      .catch(() => { if (active) setState('error'); });
    return () => { active = false; };
  }, []);

  return (
    <div className="activity-card">
      <h3>Recent Blood Requests</h3>
      {state === 'loading' && <p className="dashboard-empty">Loading requests…</p>}
      {state === 'error' && <p className="dashboard-empty">Request activity is unavailable.</p>}
      {state === 'ready' && requests.length === 0 && <p className="dashboard-empty">No blood requests have been submitted yet.</p>}
      {state === 'ready' && requests.map((request) => (
        <div key={request.id} className="activity-row">
          <span className="dot" />
          <div className="activity-request-copy">
            <strong>{request.blood_group} · {request.units_required} {request.units_required === 1 ? 'unit' : 'units'}</strong>
            <small>{request.patient_name} · {request.request_status.replaceAll('_', ' ')}</small>
          </div>
          <time dateTime={request.created_at}>{new Date(request.created_at).toLocaleDateString()}</time>
        </div>
      ))}
    </div>
  );
}
