const AlertMessage = ({ children, variant = 'danger', className = '' }) => {
  if (!children) return null;
  return <div className={`alert alert-${variant} ${className}`.trim()} role="alert">{children}</div>;
};

export default AlertMessage;
