import { Button, FormField, SelectField } from '../../common/index.js';

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
                {field.type === 'select' ? (
                  <SelectField
                    label={field.label}
                    id={`admin-form-${field.name}`}
                    name={field.name}
                    onChange={onChange}
                    value={values[field.name] ?? ''}
                    disabled={disabled || field.disabled}
                    required={field.required}
                    options={field.options}
                  />
                ) : (
                  <FormField
                    label={field.label}
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
        <Button
          variant="outline-secondary"
          onClick={onCancel}
          disabled={disabled}
        >
          Cancelar
        </Button>
        <Button type="submit" loading={disabled}>{submitLabel}</Button>
      </div>
    </form>
  );
};

export default AdminForm;
