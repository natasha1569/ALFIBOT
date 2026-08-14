const AdminFilters = ({
  fields,
  values,
  onChange,
  onSubmit,
  onClear,
  disabled = false,
}) => {
  return (
    <form className="row g-3 align-items-end mb-4" onSubmit={onSubmit}>
      {fields.map((field) => (
        <div className={field.columnClass || 'col-12 col-md-4'} key={field.name}>
          <label className="form-label" htmlFor={field.id || field.name}>
            {field.label}
          </label>

          {field.type === 'select' ? (
            <select
              className="form-select"
              id={field.id || field.name}
              name={field.name}
              onChange={onChange}
              value={values[field.name] ?? ''}
              disabled={disabled}
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
              id={field.id || field.name}
              name={field.name}
              onChange={onChange}
              placeholder={field.placeholder}
              type={field.type || 'text'}
              value={values[field.name] ?? ''}
              disabled={disabled}
            />
          )}
        </div>
      ))}

      <div className="col-12 col-md-auto d-flex gap-2">
        <button className="btn btn-primary" type="submit" disabled={disabled}>
          Filtrar
        </button>
        <button
          className="btn btn-outline-secondary"
          onClick={onClear}
          type="button"
          disabled={disabled}
        >
          Limpiar
        </button>
      </div>
    </form>
  );
};

export default AdminFilters;
