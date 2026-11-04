export default function DonorCard({ name, bloodGroup, city, status }) {
  return (
    <div className="info-card donor-card">
      <h4>{name}</h4>
      <p>Blood Group: {bloodGroup}</p>
      <p>City: {city}</p>
      <p>Status: {status}</p>
    </div>
  );
}
