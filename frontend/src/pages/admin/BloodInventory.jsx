import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Plus, RefreshCw } from 'lucide-react';
import AdminLayout from '../../components/layout/AdminLayout';
import api from '../../services/api';

export default function BloodInventory() {
  const [units, setUnits] = useState([]);
  const [state, setState] = useState('loading');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const loadUnits = async () => {
    setState('loading');
    setMessage('');
    try {
      const { data } = await api.get('/inventory');
      setUnits(data.data || []);
      setState('ready');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Unable to load inventory.');
      setState('error');
    }
  };

  useEffect(() => { loadUnits(); }, []);

  const addUnit = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    setSaving(true);
    try {
      await api.post('/inventory', {
        unit_id: form.unit_id.value.trim(),
        blood_group: form.blood_group.value,
        component: form.component.value,
        collection_date: form.collection_date.value || null,
        expiry_date: form.expiry_date.value || null
      });
      form.reset();
      toast.success('Blood unit added to inventory.');
      await loadUnits();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to add this unit.');
    } finally {
      setSaving(false);
    }
  };

  const updateScreening = async (unit) => {
    const screeningStatus = unit.screening_status === 'approved' ? 'pending' : 'approved';
    try {
      await api.put(`/inventory/${unit.id}`, { screening_status: screeningStatus });
      toast.success(`Unit ${screeningStatus}.`);
      await loadUnits();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to update screening status.');
    }
  };

  return (
    <AdminLayout>
      <div className="panel-header"><div><span className="eyebrow section-eyebrow">STOCK MANAGEMENT</span><h1>Blood inventory</h1></div><button className="dashboard-refresh" type="button" onClick={loadUnits} disabled={state === 'loading'}><RefreshCw size={15} /> Refresh</button></div>
      <section className="workflow-panel inventory-form">
        <h2><Plus size={18} /> Add a blood unit</h2>
        <form onSubmit={addUnit}>
          <div className="workflow-fields workflow-fields-three">
            <div className="field-group"><label className="field-label" htmlFor="unit_id">Unit ID</label><input className="input" id="unit_id" name="unit_id" required maxLength={80} /></div>
            <div className="field-group"><label className="field-label" htmlFor="blood_group">Blood group</label><select className="input" id="blood_group" name="blood_group">{['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((group) => <option key={group}>{group}</option>)}</select></div>
            <div className="field-group"><label className="field-label" htmlFor="component">Component</label><select className="input" id="component" name="component"><option value="whole_blood">Whole blood</option><option value="red_cells">Red blood cells</option><option value="platelets">Platelets</option><option value="plasma">Plasma</option></select></div>
          </div>
          <div className="workflow-fields"><div className="field-group"><label className="field-label" htmlFor="collection_date">Collection date</label><input className="input" id="collection_date" name="collection_date" type="date" /></div><div className="field-group"><label className="field-label" htmlFor="expiry_date">Expiry date</label><input className="input" id="expiry_date" name="expiry_date" type="date" /></div></div>
          <button className="btn btn-primary workflow-submit" type="submit" disabled={saving}>{saving ? 'Saving…' : 'Add unit'}</button>
        </form>
      </section>
      <section className="inventory-list">
        <h2>Recorded units <span>{units.length}</span></h2>
        {message && <div className="search-message search-error">{message}</div>}
        {state === 'loading' && <div className="loader" aria-label="Loading inventory" />}
        {state === 'ready' && units.length === 0 && <div className="dashboard-notice"><p>No inventory units have been recorded.</p></div>}
        {state === 'ready' && units.length > 0 && <div className="table-scroll"><table className="data-table admin-data-table"><thead><tr><th>Unit ID</th><th>Group</th><th>Component</th><th>Expiry</th><th>Screening</th><th>Status</th><th></th></tr></thead><tbody>
          {units.map((unit) => <tr key={unit.id}><td>{unit.unit_id}</td><td><span className="group-tag">{unit.blood_group}</span></td><td>{unit.component.replaceAll('_', ' ')}</td><td>{unit.expiry_date || '—'}</td><td><span className={`request-status ${unit.screening_status === 'approved' ? 'status-approved' : ''}`}>{unit.screening_status}</span></td><td>{unit.unit_status}</td><td><button className="table-action" type="button" onClick={() => updateScreening(unit)}>{unit.screening_status === 'approved' ? 'Recheck' : 'Approve'}</button></td></tr>)}
        </tbody></table></div>}
      </section>
    </AdminLayout>
  );
}
