import { saveAs } from "file-saver";
import { useState, useMemo } from "react";
import { FaFileInvoiceDollar } from "react-icons/fa";
import { toast } from "react-toastify";
import { useGetMonthlyInvoiceStatsQuery } from "../redux/billingSlice";
import {
  useMonthlyFullInvoiceReportMutation,
  useMonthlyInvoicesToBeGeneratedReportMutation,
} from "../redux/reportSlice";
import { reportTypes } from "../utils/dataHelper";
import Button from "./Button";
import InputSelect from "./InputSelect";
import Modal from "./Modals/Modal";

// Helper function to get month display format and query format
const getMonthDisplay = (date) => ({
  display: date.toLocaleString("default", { month: "short", year: "2-digit" }),
  query: date.toLocaleString("default", { month: "short", year: "2-digit" }),
});

// Helper function to get fixed months around current month
const getFixedMonths = () => {
  const currentDate = new Date();
  const months = [];
  for (let i = -2; i <= 2; i++) {
    const date = new Date(currentDate);
    date.setMonth(currentDate.getMonth() + i);
    months.push({
      date,
      ...getMonthDisplay(date),
    });
  }
  return months;
};

const InvoiceStatsCard = () => {
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState("");
  const [report, setReport] = useState("invoiceToGenerate");
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Get fixed months based on current date only
  const months = useMemo(() => getFixedMonths(), []); // Only computed once when component mounts
  const { data: monthlyStats, isLoading } = useGetMonthlyInvoiceStatsQuery({
    month: getMonthDisplay(selectedDate).query,
  });

  const [invoicesToGenerate, { isLoading: invoicesToGenerateLoading }] =
    useMonthlyInvoicesToBeGeneratedReportMutation();
  const [monthlyInvoiceReport, { isLoading: monthlyInvoiceReportLoading }] =
    useMonthlyFullInvoiceReportMutation();
  const handleClose = () => {
    setOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!month || !report) {
      toast.error("Please select month and report type");
      return;
    }

    try {
      let res = "";
      if (report === "invoiceToGenerate") {
        res = await invoicesToGenerate({ month }).unwrap();
        if (res.link) saveAs(res.link, `${month}_Invoices_To_Generate`);
      } else if (report === "monthlyInvoice") {
        res = await monthlyInvoiceReport({ month }).unwrap();
        if (res.link) saveAs(res.link, `${month}_Full_Invoice_Report`);
      }

      toast.success("Reports generated successfully");
      setOpen(false);
      setReport("invoiceToGenerate");
    } catch (error) {
      console.log(error);
      toast.error(error?.data?.msg || error.error);
    }
  };

  const stats = [
    {
      id: 1,
      name: "Invoices To Be Generated",
      stat: monthlyStats?.toGenerate,
      icon: FaFileInvoiceDollar,
      change: "122",
      changeType: "increase",
      backgroundColor: "bg-indigo-500",
    },
    {
      id: 2,
      name: "Pending Payment Invoices",
      stat: monthlyStats?.pending,
      icon: FaFileInvoiceDollar,
      change: "5.4%",
      changeType: "increase",
      backgroundColor: "bg-yellow-500",
    },
    {
      id: 3,
      name: "Received Payment Invoices",
      stat: monthlyStats?.received,
      icon: FaFileInvoiceDollar,
      change: "3.2%",
      changeType: "decrease",
      backgroundColor: "bg-green-500",
    },
    {
      id: 4,
      name: "Cancelled Invoices",
      stat: monthlyStats?.cancelled,
      icon: FaFileInvoiceDollar,
      change: "122",
      changeType: "increase",
      backgroundColor: "bg-red-500",
    },
  ];

  return (
    <div className="bg-slate-100 rounded-lg p-4 pb-8 shadow-md mb-5">
      <div className="flex items-center justify-center space-x-4 mb-6">
        <h3 className="text-2xl font-semibold text-gray-900">
          Invoice Statistics
        </h3>
        <div className="flex bg-white rounded-lg p-1 shadow-sm">
          {months.map((monthData) => (
            <button
              key={monthData.display}
              onClick={() => setSelectedDate(monthData.date)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors mx-1
                ${
                  monthData.date.getMonth() === selectedDate.getMonth() &&
                  monthData.date.getYear() === selectedDate.getYear()
                    ? "bg-indigo-500 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
            >
              {monthData.display}
            </button>
          ))}
        </div>
      </div>
      <dl className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
        {stats?.map((item) => (
          <div
            key={item.id}
            className="relative overflow-hidden rounded-lg bg-white pl-4 pr-2 pt-5 shadow sm:pt-6"
          >
            <dt>
              <div
                className={`absolute rounded-md ${item.backgroundColor} p-3`}
              >
                <item.icon aria-hidden="true" className="h-6 w-6 text-white" />
              </div>
              <p className="ml-[60px] truncate text-sm font-medium text-gray-500">
                {item.name}
              </p>
            </dt>
            <dd className="ml-[60px] flex items-baseline pb-6 sm:pb-7">
              <p className="text-2xl font-semibold text-gray-900">
                {item.stat}
              </p>
              {/* <p
                className={`ml-2 flex items-baseline text-sm font-semibold ${
                  item.changeType === "increase"
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {item.changeType === "increase" ? (
                  <ArrowUpIcon
                    aria-hidden="true"
                    className="h-5 w-5 flex-shrink-0 self-center text-green-500"
                  />
                ) : (
                  <ArrowDownIcon
                    aria-hidden="true"
                    className="h-5 w-5 flex-shrink-0 self-center text-red-500"
                  />
                )}

                <span className="sr-only">
                  {" "}
                  {item.changeType === "increase"
                    ? "Increased"
                    : "Decreased"}{" "}
                  by{" "}
                </span>
                {item.change}
              </p> */}
            </dd>
          </div>
        ))}
        <div className="col-span-1">
          <Button
            label="Report Generation"
            handleClick={() => setOpen(true)}
            height="h-10"
            width="w-full"
          />
          <Modal open={open}>
            <div className="md:my-10 lg:my-1 md:w-[300px]">
              <h4 className="text-center text-xl font-semibold mb-4">
                Report Generation
              </h4>

              <form className="space-y-4" onSubmit={handleSubmit}>
                <div>
                  <p className="text-sm font-medium mb-1">Select Month</p>
                  <input
                    type="month"
                    className="p-1 px-4 border-2 w-full text-sm rounded text-gray-600 placeholder-gray-500 "
                    placeholder="Select Month"
                    value={month}
                    onChange={(e) => setMonth(e.target.value)}
                    required={true}
                  />
                </div>
                <div>
                  <InputSelect
                    options={reportTypes}
                    value={report}
                    onChange={setReport}
                    label="Report Type"
                  />
                </div>
                <div className="flex gap-4">
                  <Button
                    label={`${
                      invoicesToGenerateLoading || monthlyInvoiceReportLoading
                        ? "Generating..."
                        : "Generate Report"
                    }`}
                    height="h-10"
                    width="w-full"
                    color="bg-green-500"
                    type="submit"
                    disabled={
                      invoicesToGenerateLoading || monthlyInvoiceReportLoading
                    }
                  />
                  <Button
                    label="Cancel"
                    height="h-10"
                    width="w-full"
                    color="bg-gray-500"
                    handleClick={handleClose}
                    disabled={invoicesToGenerateLoading}
                  />
                </div>
                <div className="w-1/3 ml-4"></div>
              </form>
            </div>
          </Modal>
        </div>
      </dl>
    </div>
  );
};

export default InvoiceStatsCard;
