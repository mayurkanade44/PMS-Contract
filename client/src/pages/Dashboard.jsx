import { useDailyServicesQuery } from "../redux/reportSlice";
import { AlertMessage, Loading } from "../components";

const Dashboard = () => {
  const {
    data: dailyServices,
    isLoading: dailyLoading,
    error,
  } = useDailyServicesQuery();

  return (
    <div className="my-5">
      {dailyLoading ? (
        <Loading />
      ) : (
        error && <AlertMessage>{error?.data?.msg || error.error}</AlertMessage>
      )}
      {dailyServices && (
        <>
          <h2 className="text-center text-lg font-semibold pb-4">
            {dailyServices.length < 1
              ? "No Schedule Jobs Today"
              : "Today's Schedule Jobs"}
          </h2>
          <div className="overflow-y-auto">
            <table className="min-w-full border text-sm font-light dark:border-neutral-500">
              <thead className="border-b font-medium dark:border-neutral-800 border-2">
                <tr>
                  <th className="border-r px-2 py-1 dark:border-neutral-800 border-2">
                    Contract Number
                  </th>
                  <th className="border-r px-2 py-1 dark:border-neutral-800 border-2">
                    Bill To Name
                  </th>
                  <th className="border-r px-2 py-1 dark:border-neutral-800 border-2">
                    Services
                  </th>
                  <th className="border-r px-2 py-1 dark:border-neutral-800 border-2">
                    Frequency
                  </th>
                </tr>
              </thead>
              <tbody>
                {dailyServices?.map((service) => (
                  <tr
                    className="border-b dark:border-neutral-500"
                    key={service._id}
                  >
                    <td className="border-r w-32 px-2 py-1 font-normal dark:border-neutral-500">
                      {service.contract.contractNo}
                    </td>
                    <td className="border-r w-32 px-2 py-1 font-normal dark:border-neutral-500">
                      {service.contract.billToAddress.name}
                    </td>
                    <td className="border-r w-32 px-2 py-1 font-normal dark:border-neutral-500">
                      {service.services.map((item) => item.label + ", ")}
                    </td>
                    <td className="border-r w-32 px-2 py-1 font-normal dark:border-neutral-500">
                      {service.frequency}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};
export default Dashboard;
