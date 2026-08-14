const Button = ({
  type,
  className,
  onClick,
  children,
  isLoading,
  isLoadingMessage,
}) => {
  return (
    <button
      type={type}
      className={className}
      onClick={onClick}
      disabled={isLoading}
    >
      {isLoading ? isLoadingMessage : children}
    </button>
  );
};

export default Button;
