export default function FormField({ label, error, hint, as = 'input', children, ...props }) {
  const Tag = as;
  return (
    <div className={`field ${error ? 'has-error' : ''}`}>
      <label>{label}</label>
      {as === 'select' ? <select {...props}>{children}</select> : <Tag {...props} />}
      {hint && !error && <small className="hint">{hint}</small>}
      {error && <small className="error-text">{error}</small>}
    </div>
  );
}
