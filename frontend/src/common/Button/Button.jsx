const Button = ({
  children,
  variant = 'primary',
  className = '',
  loading = false,
  disabled = false,
  type = 'button',
  ...props
}) => (
  <button
    className={`btn btn-${variant} ${className}`.trim()}
    disabled={disabled || loading}
    type={type}
    {...props}
  >
    {loading ? 'Procesando…' : children}
  </button>
);

export default Button;
