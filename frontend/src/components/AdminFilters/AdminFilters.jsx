import { Button, FormField, SelectField } from '../../common/index.js';

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
          {field.type === 'select' ? (
            <SelectField
              label={field.label}
              id={field.id || field.name}
              name={field.name}
              onChange={onChange}
              value={values[field.name] ?? ''}
              disabled={disabled}
              options={field.options}
            />
          ) : (
            <FormField
              label={field.label}
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
        <Button type="submit" disabled={disabled}>Filtrar</Button>
        <Button
          variant="outline-secondary"
          onClick={onClear}
          disabled={disabled}
        >
          Limpiar
        </Button>
      </div>
    </form>
  );
};

export default AdminFilters;
