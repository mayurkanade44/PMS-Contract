import Select from "react-select";

const InputSelect = ({ onChange, options, value, placeholder, label }) => {
  return (
    <div>
      <label className="block text-sm font-medium leading-6 text-gray-900">
        {label}
        <span className="text-red-500 required-dot ml-0.5">*</span>
      </label>
      <Select
        placeholder={placeholder}
        isClearable
        options={options}
        value={value ? options.find((c) => c.value === value) : value}
        onChange={(val) => onChange(val ? val.value : val)}
        styles={{
          control: (baseStyles, state) => ({
            ...baseStyles,
            minHeight: "31px",
            height: "31px",
            boxShadow: state.isFocused ? null : null,
            marginTop: "2px",
            borderColor: "#CCCCCC",
            borderWidth: "2px",
          }),

          valueContainer: (provided, state) => ({
            ...provided,
            height: "31px",
            padding: "0 5px",
          }),

          input: (provided, state) => ({
            ...provided,
            margin: "0px",
          }),

          indicatorsContainer: (provided, state) => ({
            ...provided,
            height: "31px",
          }),
        }}
      />
    </div>
  );
};
export default InputSelect;
