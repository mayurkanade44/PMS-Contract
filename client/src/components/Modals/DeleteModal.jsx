import { AiOutlineDelete } from "react-icons/ai";
import Modal from "./Modal";

const DeleteModal = ({
  open,
  close,
  title,
  description,
  handleClick,
  label,
}) => {
  return (
    <Modal open={open}>
      <div className="text-center w-60">
        <AiOutlineDelete className="text-red-500 mx-auto w-10 h-10" />
        <div className="mx-auto my-1">
          <h3 className="text-lg font-black text-gray-800">{title}</h3>
          <p className="text-sm text-gray-500">{description}</p>
        </div>
        <div className="flex gap-4 pt-2">
          <button
            onClick={handleClick}
            type="button"
            className="btn bg-red-700 w-full rounded-md text-white py-1 cursor-pointer"
          >
            {label || "Delete"}
          </button>
          <button
            onClick={close}
            type="button"
            className="btn bg-gray-200 w-full rounded-md text-dark py-1 font-semibold cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    </Modal>
  );
};
export default DeleteModal;
