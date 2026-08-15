const FormField = ({ label, id, icon, className = '', ...inputProps }) => (
  <div className={className}>
    <label className="form-label" htmlFor={id}>{label}</label>
    <div className={icon ? 'alfi-login-input' : undefined}>
      {icon && <i className={`bi ${icon}`} aria-hidden="true"></i>}
      <input className={icon ? undefined : 'form-control'} id={id} {...inputProps} />
    </div>
  </div>
);

export default FormField;
