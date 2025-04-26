import { useEffect, useState } from "react";
import { useGetMonthlyInvoiceStatsQuery } from "../redux/billingSlice";
import { FaFileInvoiceDollar } from "react-icons/fa";
const InvoiceStatsCard = () => {
  const { data: monthlyStats, isLoading } = useGetMonthlyInvoiceStatsQuery();

  const stats = [
    {
      id: 1,
      name: "Total Invoices To Be Generated",
      stat: monthlyStats?.toGenerate,
      icon: FaFileInvoiceDollar,
      change: "122",
      changeType: "increase",
      backgroundColor: "bg-indigo-500",
    },
    {
      id: 2,
      name: "Total Pending Payment Invoices",
      stat: monthlyStats?.pending,
      icon: FaFileInvoiceDollar,
      change: "5.4%",
      changeType: "increase",
      backgroundColor: "bg-yellow-500",
    },
    {
      id: 3,
      name: "Total Received Payment Invoices",
      stat: monthlyStats?.received,
      icon: FaFileInvoiceDollar,
      change: "3.2%",
      changeType: "decrease",
      backgroundColor: "bg-green-500",
    },
    {
      id: 4,
      name: "Total Cancelled Invoices",
      stat: monthlyStats?.cancelled,
      icon: FaFileInvoiceDollar,
      change: "122",
      changeType: "increase",
      backgroundColor: "bg-red-500",
    },
  ];

  return (
    <div className="bg-slate-100 rounded-lg p-4 pb-8 shadow-md mb-5">
      <h3 className="text-2xl font-semibold leading-6 text-gray-900 text-center">
        {new Date().toLocaleString("default", {
          month: "long",
          year: "numeric",
        })}
      </h3>
      <dl className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats?.map((item) => (
          <div
            key={item.id}
            className="relative overflow-hidden rounded-lg bg-white px-4 pt-5 shadow sm:px-6 sm:pt-6"
          >
            <dt>
              <div
                className={`absolute rounded-md ${item.backgroundColor} p-3`}
              >
                <item.icon aria-hidden="true" className="h-6 w-6 text-white" />
              </div>
              <p className="ml-16 truncate text-sm font-medium text-gray-500">
                {item.name}
              </p>
            </dt>
            <dd className="ml-16 flex items-baseline pb-6 sm:pb-7">
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
      </dl>
    </div>
  );
};

export default InvoiceStatsCard;
