import { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import AdminLayout from '../../components/layout/AdminLayout';
import api from '../../services/api';

const requestStatuses = ['under_review', 'approved', 'rejected', 'reserved', 'fulfilled', 'cancelled'];

export default function BloodRequests() {
  const [requests, setRequests] = useState([]);
  const [state, setState] = useState('loading');
  const [message, setMessage] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  const loadRequests = async () => {
    setState('loading');
    setMessage('');
    try {
      const { data } = await api.get('/requests');
      setRequests(data.data || []);
      setState('ready');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Unable to load blood requests.');
      setState('error');
    }
  };

  useEffect(() => { loadRequests(); }, []);

  const updateStatus = async (id, status) => {
    setUpdatingId(id);
    try {
      const { data } = await api.put(`/requests/${id}/status`, { status });
      setRequests((current) => current.map((request) => request.id === id ? data.data : request));
      toast.success('Request status updated.');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to update request status.');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <AdminLayout>
      <div className="panel-header"><div><span className="eyebrow section-eyebrow">FULFILMENT</span><h1>Blood requests</h1></div><button className="dashboard-refresh" type="button" onClick={loadRequests} disabled={state === 'loading'}><RefreshCw size={15} /> Refresh</button></div>
      {message && <div className="search-message search-error">{message}</div>}
      {state === 'loading' && <div className="loader" aria-label="Loading requests" />}
      {state === 'ready' && requests.length === 0 && <div className="dashboard-notice"><p>No blood requests have been submitted.</p></div>}
      {state === 'ready' && requests.length > 0 && <div className="table-scroll"><table className="data-table admin-data-table"><thead><tr><th>Patient / group</th><th>Units</th><th>Urgency</th><th>Required by</th><th>Status</th><th>Update status</th></tr></thead><tbody>
        {requests.map((request) => <tr key={request.id}><td><strong>{request.patient_name}</strong><small className="table-subtext">{request.blood_group} · {request.blood_component.replaceAll('_', ' ')}</small></td><td>{request.units_required}</td><td><span className={`request-status ${request.emergency_level === 'emergency' ? 'status-rejected' : ''}`}>{request.emergency_level}</span></td><td>{request.required_date || '—'}</td><td><span className="request-status">{request.request_status.replaceAll('_', ' ')}</span></td><td><select className="admin-status-select" aria-label={`Update status for ${request.patient_name}`} value={request.request_status} disabled={updatingId === request.id} onChange={(event) => updateStatus(request.id, event.target.value)}><option value={request.request_status} disabled>{request.request_status.replaceAll('_', ' ')}</option>{requestStatuses.filter((status) => status !== request.request_status).map((status) => <option value={status} key={status}>{status.replaceAll('_', ' ')}</option>)}</select></td></tr>)}
      </tbody></table></div>}
    </AdminLayout>
  );
}
