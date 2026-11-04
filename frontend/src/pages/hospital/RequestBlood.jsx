import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Droplets, HeartPulse } from 'lucide-react';
import HospitalLayout from '../../components/layout/HospitalLayout';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export default function RequestBlood() {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [saving, setSaving] = useState(false);

  const submitRequest = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    setSaving(true);
    try {
      const { data } = await api.post('/requests', {
        patient_name: form.patient_name.value.trim(),
        blood_group: form.blood_group.value,
        blood_component: form.blood_component.value,
        units_required: Number(form.units_required.value),
        required_date: form.required_date.value || null,
        hospital_address: form.hospital_address.value.trim(),
        contact_information: form.contact_information.value.trim(),
        emergency_level: form.emergency_level.value,
        reason: form.reason.value.trim() || null
      });
      toast.success(`Request ${data.data.id.slice(0, 8)} submitted.`);
      form.reset();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to submit your request.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <HospitalLayout>
      <div className="workflow-page">
        <div className="workflow-page-heading">
          <span className="eyebrow section-eyebrow"><HeartPulse size={14} /> REQUEST SUPPORT</span>
          <h1>Request blood</h1>
          <p>Share the details so the team can review the need and help coordinate next steps.</p>
        </div>
        <section className="workflow-panel workflow-request-panel">
          <div className="workflow-panel-intro"><span className="workflow-panel-icon"><Droplets size={20} /></span><div><h2>Patient and request details</h2><p>Provide accurate information to help the blood bank respond.</p></div></div>
          {loading ? <div className="loader" aria-label="Loading account" /> : user ? (
            <form onSubmit={submitRequest}>
              <div className="workflow-fields">
                <div className="field-group"><label className="field-label" htmlFor="patient_name">Patient name</label><input className="input" id="patient_name" name="patient_name" autoComplete="name" required maxLength={120} /></div>
                <div className="field-group"><label className="field-label" htmlFor="blood_group">Blood group</label><select className="input" id="blood_group" name="blood_group" required>{['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((group) => <option key={group}>{group}</option>)}</select></div>
              </div>
              <div className="workflow-fields workflow-fields-three">
                <div className="field-group"><label className="field-label" htmlFor="blood_component">Component</label><select className="input" id="blood_component" name="blood_component"><option value="whole_blood">Whole blood</option><option value="red_cells">Red blood cells</option><option value="platelets">Platelets</option><option value="plasma">Plasma</option></select></div>
                <div className="field-group"><label className="field-label" htmlFor="units_required">Units required</label><input className="input" id="units_required" name="units_required" type="number" min="1" max="20" defaultValue="1" required /></div>
                <div className="field-group"><label className="field-label" htmlFor="required_date">Needed by</label><input className="input" id="required_date" name="required_date" type="date" /></div>
              </div>
              <div className="workflow-fields">
                <div className="field-group"><label className="field-label" htmlFor="contact_information">Contact information</label><input className="input" id="contact_information" name="contact_information" placeholder="Phone number" required maxLength={80} /></div>
                <div className="field-group"><label className="field-label" htmlFor="emergency_level">Urgency</label><select className="input" id="emergency_level" name="emergency_level"><option value="normal">Routine</option><option value="urgent">Urgent</option><option value="emergency">Emergency</option></select></div>
              </div>
              <div className="field-group"><label className="field-label" htmlFor="hospital_address">Hospital / required location</label><input className="input" id="hospital_address" name="hospital_address" placeholder="Hospital name and address" required maxLength={250} /></div>
              <div className="field-group"><label className="field-label" htmlFor="reason">Additional notes <span>(optional)</span></label><textarea className="input workflow-textarea" id="reason" name="reason" rows="3" maxLength={1000} placeholder="Anything the team should know" /></div>
              <button className="btn btn-primary workflow-submit" type="submit" disabled={saving}>{saving ? 'Submitting…' : 'Submit blood request'}</button>
              <p className="workflow-disclaimer">For immediate medical emergencies, contact local emergency services and the hospital directly. This form is not an emergency dispatch service.</p>
            </form>
          ) : <div className="workflow-signin"><p>Create an account or sign in to submit a blood request and keep its status private in your request history.</p><Link className="btn btn-primary" to="/login" state={{ from: location.pathname }}>Sign in to continue</Link><span>New to LifeLink? <Link to="/register" state={{ from: location.pathname, role: 'patient' }}>Create an account</Link></span></div>}
        </section>
      </div>
    </HospitalLayout>
  );
}
