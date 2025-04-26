import { saveAs } from "file-saver";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { setInvoiceDetails } from "../redux/allSlice";
import { useCancelInvoiceMutation } from "../redux/billingSlice";
import { dateFormat } from "../utils/functionHelper";
import Button from "./Button";
import DeleteModal from "./Modals/DeleteModal";
import { AiOutlineDelete } from "react-icons/ai";
import { RiDownload2Fill } from "react-icons/ri";
const InvoiceTable = ({ invoices, isLoading, setOpen }) => {
  const [openCancelModal, setOpenCancelModal] = useState(false);
  const dispatch = useDispatch();
  const [cancelInvoice, { isLoading: cancelLoading }] =
    useCancelInvoiceMutation();

  const handleEditModal = (invoice) => {
    if (invoice.isCancelled) return;
    dispatch(
      setInvoiceDetails({
        id: invoice._id,
        type: invoice.type,
        paymentStatus: invoice.paymentStatus,
        paymentMode: invoice.paymentMode,
        paymentDate: invoice?.paymentDate
          ? new Date(invoice?.paymentDate).toISOString().slice(0, 10)
          : new Date(),
        paymentRefernce: invoice.paymentRefernce,
        remark: invoice.remark,
        gstNo: invoice.bill.gstNo,
      })
    );
    setOpen(true);
  };

  const progress = (status) => {
    let text = "text-blue-700 bg-blue-100";
    if (status === "Received") text = "text-green-700 bg-green-100";
    else text = "text-red-700 bg-red-100";

    return (
      <p
        className={`inline-flex items-center rounded-md px-2 py-1 font-medium ${text} ring-1 ring-gray-300`}
      >
        {status}
      </p>
    );
  };

  return (
    <div className="w-full overflow-x-scroll xl:overflow-x-hidden">
      <table className="min-w-full bg-white rounded">
        <thead>
          <tr className="w-full h-12 border-gray-300 border-b py-10 bg-indigo-100 ">
            <th className="font-semibold w-24 whitespace-nowrap px-2 text-center text-sm">
              Refernce Number
            </th>
            <th className="font-semibold w-24 whitespace-nowrap px-2 text-center text-sm">
              Invoice Number
            </th>
            <th className="font-semibold w-24 whitespace-nowrap px-2 text-center text-sm">
              Created Date
            </th>
            <th className="font-semibold w-24 whitespace-nowrap px-2 text-center text-sm">
              Client Name
            </th>
            <th className="font-semibold w-24 whitespace-nowrap px-2 text-center text-sm">
              Amount
            </th>
            <th className="font-semibold w-24 whitespace-nowrap px-2 text-center text-sm">
              Payement Status
            </th>
            <th className="font-semibold w-24 whitespace-nowrap px-2 text-center text-sm">
              Payement Mode
            </th>
            <th className="font-semibold w-24 whitespace-nowrap px-2 text-center text-sm">
              Payement Date
            </th>
            <th className="font-semibold w-24 whitespace-nowrap px-2 text-center text-sm">
              Sales Person
            </th>
            <th className="font-semibold w-24 whitespace-nowrap px-2 text-center text-sm">
              Action
            </th>
          </tr>
        </thead>
        <tbody>
          {invoices?.map((invoice) => (
            <tr
              key={invoice._id}
              className={`h-10 text-[12px] border-gray-300 border-t border-b hover:border-indigo-300 hover:shadow-md transition duration-150 ease-in-out hover:cursor-default ${
                invoice.isCancelled && "opacity-50 bg-red-100"
              }`}
            >
              <td className="text-center whitespace-no-wrap text-gray-800 px-2 border-r hover:cursor-pointer hover:text-blue-600 hover:font-semibold hover:bg-orange-100">
                <Link to={"/billing/update/" + invoice.bill._id}>
                  {invoice.billNo}
                </Link>
              </td>
              <td
                onClick={() => handleEditModal(invoice)}
                className="text-gray-800 px-2 border-r text-center hover:cursor-pointer hover:text-blue-600 hover:font-semibold hover:bg-blue-100"
              >
                {invoice.number}
              </td>
              <td className="text-gray-800 px-2 border-r text-center">
                {dateFormat(invoice.createdAt)}
              </td>
              <td className="text-gray-800 px-2 border-r text-center">
                {invoice.bill.billToDetails.name}
              </td>

              <td className="text-gray-800 px-2 border-r text-center">
                {invoice.bill.invoiceAmount.total}
              </td>
              <td className="text-gray-800 px-2 border-r text-center">
                {progress(invoice.paymentStatus)}
              </td>
              <td className="text-gray-800 px-2 border-r text-center">
                {invoice.paymentMode}
              </td>
              <td className="text-gray-800 px-2 border-r text-center">
                {invoice.paymentDate ? dateFormat(invoice?.paymentDate) : "N/A"}
              </td>
              <td className="text-gray-800 px-2 border-r text-center">
                {invoice.bill.contractDetails.sales}
              </td>
              <td className="flex gap-4 mt-2 justify-center items-center">
                <RiDownload2Fill
                  className="w-7 h-5 text-blue-500 bg-blue-100 border-2 rounded-sm hover:cursor-pointer hover:bg-blue-200"
                  onClick={() =>
                    saveAs(
                      invoice.url,
                      `${invoice.number}_${invoice.bill.billToDetails.name}_Invoice`
                    )
                  }
                />
                {!invoice.isCancelled && (
                  <AiOutlineDelete
                    className="w-7 h-5 text-red-500 bg-red-100 border-2 rounded-sm hover:cursor-pointer hover:bg-red-200"
                    onClick={() => setOpenCancelModal(true)}
                  />
                )}

                <DeleteModal
                  label="Confirm"
                  open={openCancelModal}
                  close={() => setOpenCancelModal(false)}
                  title="Cancel Invoice"
                  description="Are you sure you want to cancel this invoice? once cancelled, the invoice will be inactivated."
                  handleClick={() => {
                    cancelInvoice(invoice._id);
                    setOpenCancelModal(false);
                  }}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
export default InvoiceTable;
