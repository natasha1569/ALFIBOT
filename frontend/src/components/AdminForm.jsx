const AdminForm = ({
  fields,
  values,
  onChange,
  onSubmit,
  onCancel,
  submitLabel = 'Guardar',
  disabled = false,
}) => {
  return (
    <form onSubmit={onSubmit}>
      <div className="row g-3">
        {fields.map((field) => (
          <div className={field.columnClass || 'col-12'} key={field.name}>
            {field.type === 'checkbox' ? (
              <label className="form-check d-flex gap-2 align-items-center">
                <input
                  className="form-check-input m-0"
                  checked={Boolean(values[field.name])}
                  name={field.name}
                  onChange={onChange}
                  type="checkbox"
                  disabled={disabled || field.disabled}
                />
                <span>{field.label}</span>
              </label>
            ) : (
              <>
                <label className="form-label" htmlFor={`admin-form-${field.name}`}>
                  {field.label}
                </label>
                {field.type === 'select' ? (
                  <select
                    className="form-select"
                    id={`admin-form-${field.name}`}
                    name={field.name}
                    onChange={onChange}
                    value={values[field.name] ?? ''}
                    disabled={disabled || field.disabled}
                    required={field.required}
                  >
                    {field.options.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    className="form-control"
                    id={`admin-form-${field.name}`}
                    min={field.min}
                    name={field.name}
                    onChange={onChange}
                    type={field.type || 'text'}
                    value={values[field.name] ?? ''}
                    disabled={disabled || field.disabled}
                    required={field.required}
                  />
                )}
              </>
            )}
          </div>
        ))}
      </div>

      <div className="d-flex justify-content-end gap-2 mt-4">
        <button
          className="btn btn-outline-secondary"
          onClick={onCancel}
          type="button"
          disabled={disabled || field.disabled}
        >
          Cancelar
        </button>
        <button className="btn btn-primary" type="submit" disabled={disabled}>
          {disabled ? 'Guardando…' : submitLabel}
        </button>
      </div>
    </form>
  );
};

export default AdminForm;
