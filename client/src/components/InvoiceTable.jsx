import { saveAs } from "file-saver";
import { RiDownload2Fill } from "react-icons/ri";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { setInvoiceDetails } from "../redux/allSlice";
import { dateFormat } from "../utils/functionHelper";
import CancelInvoiceModal from "./Modals/CancelInvoiceModal";

const InvoiceTable = ({ invoices, isLoading, setOpen }) => {
  const dispatch = useDispatch();

  const handleEditModal = (invoice) => {
    if (invoice.cancelled.status) return;
    // Format as "YYYY-MM"
    const date = new Date(`01 ${invoice.month}`);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const formatted = `${year}-${month}`;
    dispatch(
      setInvoiceDetails({
        id: invoice._id,
        type: invoice.type,
        month: formatted,
        paymentStatus: invoice.paymentStatus,
        paymentMode: invoice.paymentMode,
        paymentDate: invoice?.paymentDate
          ? new Date(invoice?.paymentDate).toISOString().slice(0, 10)
          : "",
        paymentRefernce: invoice?.paymentRefernce,
        remark: invoice.remark,
        gstNo: invoice.bill.gstNo,
        chequeBank: invoice?.chequeBank,
        chequeDrawer: invoice?.chequeDrawer,
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
            <th className="font-semibold w-20 whitespace-nowrap px-2 text-center text-sm">
              Created
            </th>
            <th className="font-semibold w-24 whitespace-nowrap px-2 text-center text-sm">
              Billing Month
            </th>
            <th className="font-semibold w-40 whitespace-nowrap px-2 text-center text-sm">
              Client Name
            </th>
            <th className="font-semibold w-16 px-2 text-center text-sm">
              Amount
            </th>
            <th className="font-semibold w-24 whitespace-nowrap px-2 text-center text-sm">
              Payement Status
            </th>
            <th className="font-semibold w-16 whitespace-nowrap px-2 text-center text-sm">
              Payement Mode
            </th>
            <th className="font-semibold w-24 whitespace-nowrap px-2 text-center text-sm">
              Payement Date
            </th>
            <th className="font-semibold w-24 whitespace-nowrap px-2 text-center text-sm">
              Remark
            </th>
            <th className="font-semibold w-24 whitespace-nowrap px-2 text-center text-sm">
              Sales Person
            </th>
            <th className="font-semibold w-24 whitespace-nowrap px-2 text-center text-sm">
              Created By
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
                invoice.cancelled.status && "opacity-50 bg-red-100"
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
              <td className="text-gray-800 border-r text-center">
                {dateFormat(invoice.createdAt)}
              </td>
              <td className="text-gray-800 px-2 border-r text-center">
                {invoice.month}
              </td>
              <td className="text-gray-800 border-r text-center">
                {invoice.bill.billToDetails.name}
              </td>

              <td className="text-gray-800 px-1 border-r text-center">
                {invoice.type !== "MK"
                  ? invoice.bill.invoiceAmount.total
                  : invoice.bill.invoiceAmount.basic}
              </td>
              <td className="text-gray-800 px-2 border-r text-center">
                {progress(invoice.paymentStatus)}
              </td>
              <td className="text-gray-800 w-16 px-2 border-r text-center">
                {invoice.paymentMode}
              </td>
              <td className="text-gray-800 px-2 border-r text-center">
                {invoice.paymentDate ? dateFormat(invoice?.paymentDate) : "N/A"}
              </td>
              <td className="text-gray-800 px-2 border-r text-center">
                {invoice.remark}
              </td>
              <td className="text-gray-800 border-r text-center">
                {invoice.bill.contractDetails.sales}
              </td>
              <td className="text-gray-800 border-r text-center">
                {invoice.createdBy}
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
                {!invoice.cancelled.status && (
                  <CancelInvoiceModal invoiceId={invoice._id} />
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
export default InvoiceTable;
