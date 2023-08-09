const InputRow = ({
  label,
  register,
  id,
  placeholder,
  required = true,
  type,
}) => {
  return (
    <div className="relative">
      <label
        htmlFor={id}
        className="block text-md font-medium leading-6 text-gray-900"
      >
        {label}
        {required && (
          <span className="text-red-500 required-dot ml-0.5">*</span>
        )}
      </label>
      <input
        type={type || "text"}
        className={`mt-0.5 w-full py-0.5 px-2 border-2 rounded-md outline-none transition border-neutral-300 focus:border-black`}
        placeholder={placeholder}
        {...register(id, { required: required })}
      />
    </div>
  );
};
export default InputRow;
