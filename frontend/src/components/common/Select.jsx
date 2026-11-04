export default function Select({ label, options = [], ...props }) {
  return (
    <div className="field-group">
      {label && <label className="field-label">{label}</label>}
      <select className="input" {...props}>
        {options.map((option) => (
          <option key={option.value ?? option} value={option.value ?? option}>
            {option.label ?? option}
          </option>
        ))}
      </select>
    </div>
  );
}
