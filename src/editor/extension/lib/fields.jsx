const num = (raw, fallback = 0) => {
  const n = parseFloat(raw);
  return Number.isFinite(n) ? n : fallback;
};

const selectStyle = {
  background: 'var(--panel-2)',
  border: '1px solid var(--border)',
  borderRadius: 4,
  color: 'var(--text)',
  padding: '6px 8px',
  font: 'inherit',
};

export const Fields = ({ children }) => <div className="props-form">{children}</div>;

export const NumberField = ({ label, value, onChange, step = 1, min, max }) => (
  <label>
    {label}
    <input
      type="number"
      step={step}
      min={min}
      max={max}
      value={value}
      onChange={(e) => onChange(num(e.target.value, value ?? 0))}
    />
  </label>
);

export const RangeField = ({ label, value, onChange, step = 0.05, min = 0, max = 1 }) => (
  <label>
    {label}
    <input
      type="range"
      step={step}
      min={min}
      max={max}
      value={value}
      onChange={(e) => onChange(num(e.target.value, value ?? 0))}
    />
  </label>
);

export const TextField = ({ label, value, onChange, placeholder }) => (
  <label>
    {label}
    <input
      type="text"
      value={value ?? ''}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
    />
  </label>
);

export const ColorField = ({ label, value, onChange }) => (
  <label>
    {label}
    <input type="color" value={value} onChange={(e) => onChange(e.target.value)} />
  </label>
);

export const SelectField = ({ label, value, onChange, options }) => (
  <label>
    {label}
    <select style={selectStyle} value={value} onChange={(e) => onChange(e.target.value)}>
      {options.map((o) => {
        const opt = typeof o === 'string' ? { value: o, label: o } : o;
        return (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        );
      })}
    </select>
  </label>
);
