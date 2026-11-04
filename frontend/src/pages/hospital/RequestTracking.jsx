import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ClipboardList, RefreshCw } from 'lucide-react';
import HospitalLayout from '../../components/layout/HospitalLayout';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export default function RequestTracking() {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [requests, setRequests] = useState([]);
  const [state, setState] = useState('loading');
  const [message, setMessage] = useState('');

  const loadRequests = async () => {
    setState('loading');
    setMessage('');
    try {
      const { data } = await api.get('/requests');
      setRequests(Array.isArray(data?.data) ? data.data : []);
      setState('ready');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Unable to load request history.');
      setState('error');
    }
  };

  useEffect(() => {
    if (user) loadRequests();
  }, [user]);

  return (
    <HospitalLayout>
      <div className="workflow-page">
        <div className="workflow-page-heading">
          <span className="eyebrow section-eyebrow"><ClipboardList size={14} /> YOUR REQUESTS</span>
          <h1>Request tracking</h1>
          <p>Follow the status of blood requests submitted from your account.</p>
        </div>
        {!loading && user && <div className="request-tracking-actions"><span>{requests.length} {requests.length === 1 ? 'request' : 'requests'}</span><button type="button" onClick={loadRequests} disabled={state === 'loading'}><RefreshCw size={14} /> Refresh</button></div>}
        {loading && <div className="loader" aria-label="Loading account" />}
        {!loading && !user && <div className="search-empty"><span><ClipboardList size={22} /></span><h3>Sign in to track your requests</h3><p>Your request history is private and linked to your account.</p><Link className="btn btn-primary" to="/login" state={{ from: location.pathname }}>Sign in</Link></div>}
        {user && state === 'loading' && <div className="loader" aria-label="Loading requests" />}
        {user && state === 'error' && <div className="search-message search-error">{message}</div>}
        {user && state === 'ready' && requests.length === 0 && <div className="search-empty"><span><ClipboardList size={22} /></span><h3>No requests yet</h3><p>When you submit a request, its status and details will appear here.</p><Link className="btn btn-primary" to="/hospital/request-blood">Request blood</Link></div>}
        {user && state === 'ready' && requests.length > 0 && <div className="request-list">{requests.map((request) => (
          <article className="request-row" key={request.id}>
            <div className="request-group">{request.blood_group}</div>
            <div className="request-summary"><h2>{request.patient_name}</h2><p>{request.units_required} {request.units_required === 1 ? 'unit' : 'units'} · {request.blood_component.replaceAll('_', ' ')}</p><small>Requested {new Date(request.created_at).toLocaleDateString()}</small></div>
            <span className={`request-status status-${request.request_status}`}>{request.request_status.replaceAll('_', ' ')}</span>
          </article>
        ))}</div>}
      </div>
    </HospitalLayout>
  );
}
