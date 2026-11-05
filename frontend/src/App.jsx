import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';

const Home = lazy(() => import('./pages/public/Home'));
const About = lazy(() => import('./pages/public/About'));
const FindDonors = lazy(() => import('./pages/public/FindDonors'));
const BloodAvailability = lazy(() => import('./pages/public/BloodAvailability'));
const BecomeDonor = lazy(() => import('./pages/public/BecomeDonor'));
const Contact = lazy(() => import('./pages/public/Contact'));
const Login = lazy(() => import('./pages/auth/Login'));
const Register = lazy(() => import('./pages/auth/Register'));
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/auth/ResetPassword'));
const VerifyEmail = lazy(() => import('./pages/auth/VerifyEmail'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const ManageDonors = lazy(() => import('./pages/admin/ManageDonors'));
const ManagePatients = lazy(() => import('./pages/admin/ManagePatients'));
const ManageHospitals = lazy(() => import('./pages/admin/ManageHospitals'));
const BloodInventory = lazy(() => import('./pages/admin/BloodInventory'));
const Donations = lazy(() => import('./pages/admin/Donations'));
const BloodRequests = lazy(() => import('./pages/admin/BloodRequests'));
const EmergencyRequests = lazy(() => import('./pages/admin/EmergencyRequests'));
const Notifications = lazy(() => import('./pages/admin/Notifications'));
const Reports = lazy(() => import('./pages/admin/Reports'));
const AdminProfile = lazy(() => import('./pages/admin/AdminProfile'));
const Settings = lazy(() => import('./pages/admin/Settings'));
const DonorDashboard = lazy(() => import('./pages/donor/DonorDashboard'));
const DonorProfile = lazy(() => import('./pages/donor/DonorProfile'));
const DonationHistory = lazy(() => import('./pages/donor/DonationHistory'));
const DonorAvailability = lazy(() => import('./pages/donor/DonorAvailability'));
const DonorNotifications = lazy(() => import('./pages/donor/DonorNotifications'));
const HospitalDashboard = lazy(() => import('./pages/hospital/HospitalDashboard'));
const RequestBlood = lazy(() => import('./pages/hospital/RequestBlood'));
const SearchBlood = lazy(() => import('./pages/hospital/SearchBlood'));
const SearchDonors = lazy(() => import('./pages/hospital/SearchDonors'));
const RequestTracking = lazy(() => import('./pages/hospital/RequestTracking'));
const RequestHistory = lazy(() => import('./pages/hospital/RequestHistory'));
const HospitalProfile = lazy(() => import('./pages/hospital/HospitalProfile'));
const NotFound = lazy(() => import('./pages/public/NotFound'));

export default function App() {
  return (
    <Suspense fallback={<div className="loader" role="status" aria-label="Loading page" />}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/find-donors" element={<FindDonors />} />
        <Route path="/blood-availability" element={<BloodAvailability />} />
        <Route path="/become-donor" element={<BecomeDonor />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/donors" element={<ManageDonors />} />
        <Route path="/admin/patients" element={<ManagePatients />} />
        <Route path="/admin/hospitals" element={<ManageHospitals />} />
        <Route path="/admin/inventory" element={<BloodInventory />} />
        <Route path="/admin/donations" element={<Donations />} />
        <Route path="/admin/requests" element={<BloodRequests />} />
        <Route path="/admin/emergency-requests" element={<EmergencyRequests />} />
        <Route path="/admin/notifications" element={<Notifications />} />
        <Route path="/admin/reports" element={<Reports />} />
        <Route path="/admin/profile" element={<AdminProfile />} />
        <Route path="/admin/settings" element={<Settings />} />
        <Route path="/donor" element={<DonorDashboard />} />
        <Route path="/donor/profile" element={<DonorProfile />} />
        <Route path="/donor/history" element={<DonationHistory />} />
        <Route path="/donor/availability" element={<DonorAvailability />} />
        <Route path="/donor/notifications" element={<DonorNotifications />} />
        <Route path="/hospital" element={<HospitalDashboard />} />
        <Route path="/hospital/request-blood" element={<RequestBlood />} />
        <Route path="/hospital/search-blood" element={<SearchBlood />} />
        <Route path="/hospital/search-donors" element={<SearchDonors />} />
        <Route path="/hospital/track-request" element={<RequestTracking />} />
        <Route path="/hospital/history" element={<RequestHistory />} />
        <Route path="/hospital/profile" element={<HospitalProfile />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
