const LoadingIndicator = ({ label = 'Cargando…' }) => (
  <span className="d-inline-flex align-items-center gap-2" role="status">
    <span className="spinner-border spinner-border-sm" aria-hidden="true"></span>
    {label}
  </span>
);

export default LoadingIndicator;
