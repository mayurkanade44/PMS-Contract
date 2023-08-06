const InputRow = ({
  label,
  message,
  register,
  errors,
  id,
  placeholder,
  display,
  type,
}) => {
  return (
    <div className="relative">
      <label
        htmlFor={id}
        className="block text-sm font-medium leading-6 text-gray-900"
      >
        {label}
        <span className="text-red-500 required-dot ml-0.5">*</span>
      </label>
      <input
        type={type || "text"}
        className={`mt-0.5 w-full py-0.5 px-1 border-2 rounded-md outline-none transition 
        ${errors[id] ? "border-rose-500" : "border-neutral-300"} 
        ${errors[id] ? "focus:border-rose-500" : "focus:border-black"}`}
        placeholder={placeholder}
        {...register(id, { required: message })}
      />
      <p className="absolute text-xs text-red-500 -bottom-4">
        {errors[id]?.message}
      </p>
    </div>
  );
};
export default InputRow;
