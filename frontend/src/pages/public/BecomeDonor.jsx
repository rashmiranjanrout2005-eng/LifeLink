import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { HeartHandshake, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export default function BecomeDonor() {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [saving, setSaving] = useState(false);

  const submitProfile = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    setSaving(true);
    try {
      await api.post('/donors', {
        blood_group: form.blood_group.value,
        city: form.city.value.trim(),
        district: form.district.value.trim(),
        pincode: form.pincode.value.trim() || null,
        last_donation_date: form.last_donation_date.value || null
      });
      toast.success('Your donor profile is saved.');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to save your donor profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="search-page">
        <section className="availability-hero">
          <div className="container">
            <span className="eyebrow"><HeartHandshake size={15} /> BECOME A LIFELINK DONOR</span>
            <h1>Your willingness could<br /><span>be someone's turning point.</span></h1>
            <p>Register your donor profile so nearby people can find a willing, available donor.</p>
          </div>
        </section>
        <section className="section">
          <div className="container donor-join-layout">
            <div className="donor-join-copy">
              <span className="eyebrow section-eyebrow">A FEW THINGS TO KNOW</span>
              <h2>Make the connection easier.</h2>
              <div className="join-benefit"><span><ShieldCheck size={18} /></span><div><h3>Your privacy matters</h3><p>Only your blood group and general location are shown in donor search. Contact details are not public.</p></div></div>
              <div className="join-benefit"><span><HeartHandshake size={18} /></span><div><h3>You stay in control</h3><p>Choose whether you are available. Update or pause your donor profile whenever you need.</p></div></div>
            </div>
            <div className="workflow-panel">
              <h2>Donor details</h2>
              <p>Share the basics needed to find a nearby match.</p>
              {loading ? <div className="loader" aria-label="Loading account" /> : user ? (
                <form onSubmit={submitProfile}>
                  <div className="field-group"><label className="field-label" htmlFor="blood_group">Blood group</label><select className="input" id="blood_group" name="blood_group" required>{['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((group) => <option key={group}>{group}</option>)}</select></div>
                  <div className="workflow-fields">
                    <div className="field-group"><label className="field-label" htmlFor="city">City</label><input className="input" id="city" name="city" placeholder="Your city" required maxLength={100} /></div>
                    <div className="field-group"><label className="field-label" htmlFor="district">District</label><input className="input" id="district" name="district" placeholder="Your district" maxLength={100} /></div>
                  </div>
                  <div className="workflow-fields">
                    <div className="field-group"><label className="field-label" htmlFor="pincode">PIN code <span>(optional)</span></label><input className="input" id="pincode" name="pincode" inputMode="numeric" pattern="[0-9]{6}" placeholder="6-digit PIN" /></div>
                    <div className="field-group"><label className="field-label" htmlFor="last_donation_date">Last donation <span>(optional)</span></label><input className="input" id="last_donation_date" name="last_donation_date" type="date" /></div>
                  </div>
                  <label className="consent-row"><input type="checkbox" required /> <span>I agree to be listed as available and understand I can change this later.</span></label>
                  <button className="btn btn-primary workflow-submit" type="submit" disabled={saving}>{saving ? 'Saving profile…' : 'Save donor profile'}</button>
                </form>
              ) : <div className="workflow-signin"><p>Sign in with a donor account to register your availability. You can browse donor search without signing in.</p><Link className="btn btn-primary" to="/login" state={{ from: location.pathname }}>Sign in to continue</Link><span>Not a member? <Link to="/register" state={{ from: location.pathname, role: 'donor' }}>Create a donor account</Link></span></div>}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
