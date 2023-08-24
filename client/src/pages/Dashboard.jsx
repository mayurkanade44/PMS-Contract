import { useAllStatsQuery, useDailyServicesQuery } from "../redux/reportSlice";
import { AlertMessage, Button, Loading } from "../components";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { useEffect, useState } from "react";

const Dashboard = () => {
  const [showGraph, setShowGraph] = useState(false);
  const [allData, setAllData] = useState({ label: [], value: [] });

  const {
    data: dailyServices,
    isLoading: dailyLoading,
    error,
  } = useDailyServicesQuery();

  const { data: stats, isLoading: statsLoading } = useAllStatsQuery();

  ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
  );

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Chart.js Bar Chart",
      },
    },
  };

  useEffect(() => {
    if (stats) {
      setAllData({ label: Object.keys(stats), value: Object.values(stats) });
    }
  }, [stats]);

  const data = {
    labels: allData.label,
    datasets: [
      {
        label: "Service Card",
        data: allData.value,
        backgroundColor: "rgba(255, 99, 132, 0.5)",
      },
    ],
  };

  return (
    <div className="my-5">
      {dailyLoading || statsLoading ? (
        <Loading />
      ) : (
        error && <AlertMessage>{error?.data?.msg || error.error}</AlertMessage>
      )}
      {dailyServices && (
        <>
          <div className="flex justify-center gap-3 mb-4">
            <Button
              label="Today's Schedule"
              width="w-40"
              handleClick={() => setShowGraph(false)}
            />
            <Button
              label="Bar Graph"
              color="bg-pink-300"
              handleClick={() => setShowGraph(true)}
            />
          </div>
          {showGraph ? (
            <Bar options={options} data={data} />
          ) : (
            <>
              <h2 className="text-center text-lg font-semibold mb-4">
                {dailyServices.length < 1
                  ? "No Schedule Jobs Today"
                  : "Today's Schedule Jobs"}
              </h2>
              <div className="overflow-y-auto">
                <table className="min-w-full border text-sm font-light dark:border-neutral-500">
                  <thead className="border-b font-medium dark:border-neutral-800 border-2">
                    <tr>
                      <th className="border-r lg:w-60 px-2 py-1 dark:border-neutral-800 border-2">
                        Contract Number
                      </th>
                      <th className="border-r px-2 py-1 dark:border-neutral-800 border-2">
                        Ship To Name
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
                          {service.contract.shipToAddress.name}
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
        </>
      )}
    </div>
  );
};
export default Dashboard;
