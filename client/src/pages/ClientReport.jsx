import { useState } from "react";
import { useGetClientReportQuery } from "../redux/reportSlice";
import { useParams } from "react-router-dom";
import { Button, Loading } from "../components";

const ClientReport = () => {
  const { id } = useParams();
  const [show, setShow] = useState(true);

  const {
    data: report,
    isLoading: reportLoading,
    error,
  } = useGetClientReportQuery(id, { skip: show });

  return (
    <div className="my-16 lg:my-4">
      {reportLoading ? (
        <Loading />
      ) : (
        error && (
          <h2 className="text-red-500 font-medium">No Service Data Found</h2>
        )
      )}
      {show ? (
        <div className="flex justify-center items-center mt-20">
          <Button
            label="Show My Service Report"
            width="w-52"
            height="h-10"
            color="bg-green-600"
            handleClick={() => setShow(false)}
          />
        </div>
      ) : (
        <>
          {report && (
            <div>
              <h1 className="text-xl font-semibold text-center">
                Contract Number : {report[0].contractNo}
              </h1>
              <h1 className="text-xl font-semibold text-center">
                Service Name : {report[0].serviceName}
              </h1>
              <div className="overflow-y-auto my-4">
                <table className="min-w-full whitespace-nowrap  border text-center text-sm font-light dark:border-neutral-500">
                  <thead className="border-b font-medium dark:border-neutral-800 border-2">
                    <tr>
                      <th className="border-r px-6 py-1 dark:border-neutral-800 border-2">
                        Service Date
                      </th>
                      <th className="border-r px-6 py-1 dark:border-neutral-800 border-2">
                        Service Type
                      </th>
                      <th className="border-r px-6 py-1 dark:border-neutral-800 border-2">
                        Service Status
                      </th>
                      <th className="border-r px-6 py-1 dark:border-neutral-800 border-2">
                        Technician Comments
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.map((item) => (
                      <tr
                        className="border-b dark:border-neutral-500"
                        key={item._id}
                      >
                        <td className="border-r px-2 py-1 font-normal dark:border-neutral-500">
                          {new Date(item.serviceDate)
                            .toISOString()
                            .slice(0, 10)}
                        </td>
                        <td className="border-r px-2 py-1 font-normal dark:border-neutral-500">
                          {item.serviceType}
                        </td>
                        <td className="border-r px-2 py-1 font-normal dark:border-neutral-500">
                          {item.serviceStatus}
                        </td>
                        <td className="border-r px-2 py-1 font-normal dark:border-neutral-500">
                          {item.serviceComment}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
export default ClientReport;
