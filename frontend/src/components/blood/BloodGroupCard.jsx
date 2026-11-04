export default function BloodGroupCard({ group, units, status = 'Available' }) {
  return (
    <div className="info-card">
      <div className="group-tag">{group}</div>
      <h4>{units} units</h4>
      <p>{status}</p>
    </div>
  );
}
