export default function BloodRequestCard({ patient, bloodGroup, units, urgency }) {
  return (
    <div className="info-card request-card">
      <h4>{patient}</h4>
      <p>{bloodGroup} • {units} units</p>
      <span className="badge danger">{urgency}</span>
    </div>
  );
}
