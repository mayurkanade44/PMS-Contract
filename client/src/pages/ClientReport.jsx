import { useEffect, useState } from "react";
import { useGetClientReportQuery } from "../redux/reportSlice";
import { useNavigate, useParams } from "react-router-dom";
import { Button, Loading } from "../components";
import { useSelector } from "react-redux";
import logo from "../assets/logo.jpg";
import { dateFormat } from "../utils/functionHelper";

const ClientReport = () => {
  const { id } = useParams();
  const [show, setShow] = useState(true);
  const { user } = useSelector((store) => store.all);
  const navigate = useNavigate();

  const {
    data: report,
    isLoading: reportLoading,
    error,
  } = useGetClientReportQuery(id, { skip: show });

  useEffect(() => {
    if (user) navigate(`/service-card/${id}`);
  }, []);

  console.log(report);

  return (
    <div className="my-10 lg:my-5">
      <div className="flex justify-center my-2">
        <img src={logo} className="w-64 h-28" />
      </div>
      {reportLoading ? (
        <Loading />
      ) : (
        error && (
          <h2 className="text-red-500 text-xl font-medium text-center">
            No Service Data Found
          </h2>
        )
      )}
      {show ? (
        <div className="flex justify-center items-center mt-5">
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
              <hr className="h-px mt-4 mb-3 border-0 dark:bg-gray-700" />
              <h1 className="lg:text-xl font-bold text-center">
                Contract Number : {report[0].contractNo}
              </h1>
              <h1 className="lg:text-xl font-bold text-center">
                Client Name : {report[0].contract.shipToDetails?.name}
              </h1>
              <h1 className="lg:text-xl font-bold text-center">
                Client Address : {report[0].contract.shipToDetails?.address}{" "}
                {report[0].contract.shipToDetails?.area}
              </h1>
              <h1 className="lg:text-xl font-bold text-center">
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
                          {dateFormat(item.serviceDate)}
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
                <h2 className="mt-5 text-lg font-semibold text-center">
                  For any queries kindly connect over below modes:
                  <p className="text-green-600">
                    1800 2699 039/contact@pestmanagements.in
                  </p>
                </h2>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
export default ClientReport;
