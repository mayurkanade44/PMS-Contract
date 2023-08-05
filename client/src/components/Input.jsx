const Input = ({ label, message, register, errors, id, placeholder }) => {
  return (
    <div>
      <label className="form-label">{label}</label>
      <input
        className="form-control"
        placeholder={placeholder}
        type={id}
        {...register(id, { required: message })}
      />
      <p className="text-danger">{errors[id]?.message}</p>
    </div>
  );
};
export default Input;
