const Button = ({
  type,
  color,
  width,
  handleClick,
  label,
  disabled,
  height,
}) => {
  return (
    <button
      type={type || "button"}
      onClick={handleClick}
      disabled={disabled}
      className={`disabled:opacity-70 hover:opacity-80 px-1 mt-0.5 text-white text-center text-md font-semibold rounded-lg disabled:cursor-not-allowed ${
        width ? width : "w-24"
      } ${height ? height : "py-[5px]"} ${color ? color : "bg-blue-600"} `}
    >
      {label}
    </button>
  );
};
export default Button;
