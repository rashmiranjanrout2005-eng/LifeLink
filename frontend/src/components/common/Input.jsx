export default function Input({ label, error, ...props }) {
  return (
    <div className="field-group">
      {label && <label className="field-label">{label}</label>}
      <input className="input" {...props} />
      {error && <span className="field-error">{error}</span>}
    </div>
  );
}
