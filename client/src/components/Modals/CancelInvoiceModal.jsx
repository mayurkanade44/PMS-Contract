import { useState } from "react";
import { AiOutlineDelete } from "react-icons/ai";
import { toast } from "react-toastify";
import { useCancelInvoiceMutation } from "../../redux/billingSlice";
import Modal from "./Modal";

const CancelInvoiceModal = ({ invoiceId }) => {
  const [reason, setReason] = useState("");
  const [open, setOpen] = useState(false);
  const [cancelInvoice, { isLoading }] = useCancelInvoiceMutation();

  const handleCancel = async (e) => {
    e.preventDefault();
    console.log(invoiceId);
    const data = {
      reason,
    };
    try {
      await cancelInvoice({ id: invoiceId, data }).unwrap();
      setOpen(false);
      toast.success("Invoice cancelled successfully");
    } catch (error) {
      toast.error(error?.data?.msg || error.error);
      console.log(error);
    }
  };

  return (
    <>
      <AiOutlineDelete
        className="w-7 h-5 text-red-500 bg-red-100 border-2 rounded-sm hover:cursor-pointer hover:bg-red-200"
        onClick={() => setOpen(true)}
      />
      <Modal open={open}>
        <form onSubmit={handleCancel} className="text-center w-[300px]">
          <div className="mx-auto my-1">
            <h3 className="text-lg font-black text-gray-800">Cancel Invoice</h3>
            <p className="text-sm text-gray-500">
              Are you sure you want to cancel this invoice? once cancelled, the
              invoice will be inactivated.
            </p>
          </div>
          <div className="flex flex-col gap-2 my-4">
            <label className="text-sm font-medium text-gray-900 pl-1 text-left">
              Reason
            </label>
            <input
              type="text"
              className="w-full p-1 border-2 border-gray-300 rounded-md"
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>
          <div className="flex gap-4 pt-2">
            <button
              type="submit"
              className="btn bg-red-600 w-full rounded-md text-white py-1 cursor-pointer h-8"
              disabled={isLoading}
            >
              {isLoading ? "Cancelling..." : "Confirm"}
            </button>
            <button
              onClick={() => setOpen(false)}
              type="button"
              className="btn bg-gray-200 w-full rounded-md text-dark py-1 font-semibold cursor-pointer h-8"
              disabled={isLoading}
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
};

export default CancelInvoiceModal;
