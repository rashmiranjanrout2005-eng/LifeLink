import { useState } from 'react';
import { Search, MapPin, Heart, Users } from 'lucide-react';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import api from '../../services/api';

export default function FindDonors() {
  const [filters, setFilters] = useState({ bloodGroup: 'O+', city: '', district: '', pincode: '' });
  const [donors, setDonors] = useState([]);
  const [state, setState] = useState('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [demoMode, setDemoMode] = useState(false);

  const updateFilter = (event) => {
    setFilters((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const searchDonors = async (event) => {
    event.preventDefault();
    setState('loading');
    setErrorMessage('');
    try {
      const { data } = await api.get('/donors', { params: filters });
      setDonors(Array.isArray(data?.data) ? data.data : []);
      setDemoMode(Boolean(data?.demo));
      setState('results');
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Donor search is currently unavailable.');
      setState('error');
    }
  };

  return (
    <>
      <Navbar />
      <main className="search-page">
        <section className="search-hero">
          <div className="container search-hero-inner">
            <span className="eyebrow"><Heart size={14} /> THE RIGHT MATCH CAN BE CLOSER THAN YOU THINK</span>
            <h1>Find a donor.<br /><span>Find a little hope.</span></h1>
            <p>Search available community donors by blood group and location.</p>
            <form className="donor-search-form" onSubmit={searchDonors}>
              <label><span>Blood group</span><select name="bloodGroup" value={filters.bloodGroup} onChange={updateFilter}><option value="">Any blood group</option>{['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((group) => <option key={group}>{group}</option>)}</select></label>
              <label><span>City</span><input name="city" value={filters.city} onChange={updateFilter} placeholder="e.g. Berhampur" /></label>
              <label><span>District</span><input name="district" value={filters.district} onChange={updateFilter} placeholder="Optional" /></label>
              <label><span>PIN code</span><input name="pincode" value={filters.pincode} onChange={updateFilter} inputMode="numeric" maxLength="6" placeholder="Optional" /></label>
              <button type="submit" className="btn btn-primary" disabled={state === 'loading'}><Search size={17} /> {state === 'loading' ? 'Searching…' : 'Find donors'}</button>
            </form>
          </div>
        </section>
        <section className="section donor-results-section">
          <div className="container">
            <div className="section-heading-row">
              <div><span className="eyebrow section-eyebrow">COMMUNITY DONORS</span><h2>{state === 'results' ? `${donors.length} ${donors.length === 1 ? 'match' : 'matches'} found` : 'Search nearby donors'}</h2><p>Donor details are protected. Search only shows opted-in, available donors.</p></div>
              <span className="results-private"><Users size={15} /> Privacy protected</span>
            </div>
            {demoMode && <p className="availability-note">Sample donor listings are shown in demo mode. Connect Supabase to search real, opted-in donors.</p>}
            {state === 'error' && <div className="search-message search-error">{errorMessage}</div>}
            {state === 'idle' && <div className="search-empty"><span><Search size={22} /></span><h3>Start with a blood group and location</h3><p>We’ll look for available, opted-in donors matching your search.</p></div>}
            {state === 'results' && donors.length === 0 && <div className="search-empty"><span><Heart size={22} /></span><h3>No matching donors yet</h3><p>Try a nearby city or a different blood group, or check again later.</p></div>}
            {state === 'results' && donors.length > 0 && <div className="donor-results-grid">{donors.map((donor) => (
              <article className="donor-result-card" key={donor.id}>
                <div className="donor-result-icon"><Heart size={19} /></div>
                <span className="donor-blood-type">{donor.blood_group}</span>
                <h3>Available donor</h3>
                <p><MapPin size={15} /> {[donor.city, donor.district].filter(Boolean).join(', ') || 'Location not listed'}</p>
                <span className="donor-available"><i /> Available to help</span>
              </article>
            ))}</div>}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
