const SelectField = ({ label, id, options, className = '', ...selectProps }) => (
  <div className={className}>
    <label className="form-label" htmlFor={id}>{label}</label>
    <select className="form-select" id={id} {...selectProps}>
      {options.map((option) => (
        <option key={option.value} value={option.value}>{option.label}</option>
      ))}
    </select>
  </div>
);

export default SelectField;
