import { lazy, Suspense, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Activity, Droplets, Hospital, RefreshCw, Users } from 'lucide-react';
import AdminLayout from '../../components/layout/AdminLayout';
import StatCard from '../../components/dashboard/StatCard';
import RecentActivity from '../../components/dashboard/RecentActivity';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const DonationChart = lazy(() => import('../../components/dashboard/DonationChart'));
const BloodGroupChart = lazy(() => import('../../components/dashboard/BloodGroupChart'));

const emptyStats = { donors: 0, hospitals: 0, bloodUnits: 0, pendingRequests: 0 };
const emptyCharts = { donations: [], bloodGroups: [] };

export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const [stats, setStats] = useState(emptyStats);
  const [charts, setCharts] = useState(emptyCharts);
  const [state, setState] = useState('loading');
  const [errorMessage, setErrorMessage] = useState('');

  const loadDashboard = async () => {
    setState('loading');
    setErrorMessage('');
    try {
      const [statsResponse, chartsResponse] = await Promise.all([
        api.get('/dashboard/stats'),
        api.get('/dashboard/charts')
      ]);
      setStats(statsResponse.data.data);
      setCharts(chartsResponse.data.data);
      setState('ready');
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Dashboard data is unavailable.');
      setState('error');
    }
  };

  useEffect(() => {
    if (user) loadDashboard();
  }, [user]);

  return (
    <AdminLayout>
      <div className="panel-header"><div><span className="eyebrow section-eyebrow">OVERVIEW</span><h1>Admin dashboard</h1></div>
        {user && <button className="dashboard-refresh" type="button" onClick={loadDashboard} disabled={state === 'loading'}><RefreshCw size={15} /> Refresh</button>}
      </div>
      {loading && <div className="loader" aria-label="Loading account" />}
      {!loading && !user && <div className="dashboard-notice"><h2>Sign in to continue</h2><p>Administrator access is required to view operational data.</p><Link className="btn btn-primary" to="/login">Sign in</Link></div>}
      {user && state === 'error' && <div className="dashboard-notice"><h2>Dashboard unavailable</h2><p>{errorMessage}</p></div>}
      {user && state === 'loading' && <div className="loader" aria-label="Loading dashboard data" />}
      {user && state === 'ready' && (
        <>
          <div className="stats-grid">
            <StatCard title="Registered Donors" value={stats.donors.toLocaleString()} icon={<Users size={21} />} />
            <StatCard title="Hospitals" value={stats.hospitals.toLocaleString()} icon={<Hospital size={21} />} />
            <StatCard title="Blood Units" value={stats.bloodUnits.toLocaleString()} icon={<Droplets size={21} />} />
            <StatCard title="Pending Requests" value={stats.pendingRequests.toLocaleString()} icon={<Activity size={21} />} />
          </div>
          <div className="card-grid dashboard-charts">
            <Suspense fallback={<div className="chart-card dashboard-empty" role="status">Loading chart...</div>}>
              <DonationChart data={charts.donations} />
            </Suspense>
            <Suspense fallback={<div className="chart-card dashboard-empty" role="status">Loading chart...</div>}>
              <BloodGroupChart data={charts.bloodGroups} />
            </Suspense>
          </div>
          <div className="dashboard-activity"><RecentActivity /></div>
        </>
      )}
    </AdminLayout>
  );
}
