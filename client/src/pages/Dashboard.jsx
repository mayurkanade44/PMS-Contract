import {
  useAllStatsQuery,
  useContractExpiryMutation,
  useDailyServicesQuery,
  useMonthlyServiceMutation,
  useSevenDayServiceDueQuery,
} from "../redux/reportSlice";
import { AlertMessage, Button, InputSelect, Loading } from "../components";
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
import { toast } from "react-toastify";
import { saveAs } from "file-saver";

const Dashboard = () => {
  const [show, setShow] = useState("Today's Schedule");
  const [allData, setAllData] = useState({ label: [], value: [] });
  const [month, setMonth] = useState("");
  const [skip, setSkip] = useState(true);
  const [expiry, setExpiry] = useState({
    startDate: "",
    endDate: "",
  });

  const {
    data: dailyServices,
    isLoading: dailyLoading,
    error,
  } = useDailyServicesQuery();
  const { data: stats, isLoading: statsLoading } = useAllStatsQuery();
  const {
    data: dueData,
    isLoading: dueLoading,
    error: dueError,
  } = useSevenDayServiceDueQuery(show, { skip });
  const [monthlyService, { isLoading: monthlyLoading }] =
    useMonthlyServiceMutation();
  const [contractExpiry, { isLoading: expiryLoading }] =
    useContractExpiryMutation();

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

  useEffect(() => {
    if (dueData) {
      toast.success(dueData.msg);
      if (dueData.link) saveAs(dueData.link, `7th_Day_Due_Services`);
    }
    if (dueError) toast.error(dueError?.data?.msg);
    setSkip(true);
  }, [dueData, dueError]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!month) return toast.error("Please select month");

    try {
      const res = await monthlyService({ month }).unwrap();
      toast.success(res.msg);
      if (res.link) saveAs(res.link, `${month}_Services`);
    } catch (error) {
      console.log(error);
      toast.error(error?.data?.msg || error.error);
    }
  };

  const handleExpiry = async (e) => {
    e.preventDefault();
    if (!expiry.startDate || !expiry.endDate)
      return toast.error("Please expiry dates");

    const data = {
      startDate: new Date(expiry.startDate),
      endDate: new Date(expiry.endDate),
    };
    try {
      const res = await contractExpiry(data).unwrap();
      if (res.link) saveAs(res.link, `Contract Expiry`);
      toast.success("File Generated")
    } catch (error) {
      console.log(error);
      toast.error(error?.data?.msg || error.error);
    }
  };

  return (
    <div className="my-24 lg:my-5">
      {dailyLoading ||
      statsLoading ||
      monthlyLoading ||
      dueLoading ||
      expiryLoading ? (
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
              handleClick={() => setShow("Today's Schedule")}
            />
            <Button
              label="Bar Graph"
              color="bg-pink-400"
              handleClick={() => setShow("Bar Graph")}
            />
            <Button
              label="Monthly Schedule"
              color="bg-gray-600"
              width="w-40"
              handleClick={() => setShow("Monthly Schedule")}
            />
            <Button
              label="Contract Expiry"
              color="bg-orange-600"
              width="w-40"
              handleClick={() => setShow("Contract Expiry")}
            />
            <Button
              label="7Day Schedule"
              color="bg-green-600"
              width="w-40"
              handleClick={() => setSkip(false)}
            />
          </div>
          {show === "Today's Schedule" ? (
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
                      <th className="border-r px-2 py-1 dark:border-neutral-800 border-2">
                        Contract Number
                      </th>
                      <th className="border-r px-2 py-1 dark:border-neutral-800 border-2">
                        Ship To Name
                      </th>
                      <th className="border-r px-2 py-1 dark:border-neutral-800 border-2">
                        Contact Number
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
                        <td className="border-r w-20 px-2 py-1 text-center font-normal dark:border-neutral-500">
                          {service.contract.contractNo}
                        </td>
                        <td className="border-r w-32 px-2 py-1 font-normal dark:border-neutral-500">
                          {service.contract.shipToDetails.name}
                        </td>
                        <td className="border-r w-20 text-center px-2 py-1 font-normal dark:border-neutral-500">
                          {service.contract.shipToDetails.contact?.[0].number}
                        </td>
                        <td className="border-r w-40 px-2 py-1 font-normal dark:border-neutral-500">
                          {service.services.map((item) => item.label + ", ")}
                        </td>
                        <td className="border-r w-20 px-2 py-1 font-normal dark:border-neutral-500">
                          {service.frequency}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : show === "Monthly Schedule" ? (
            <div className="flex justify-center">
              <form onSubmit={handleSubmit} className="flex">
                <label className="w-28 text-md font-medium leading-6 text-gray-900">
                  Select Month:
                </label>
                <input
                  type="month"
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  className="mr-3 px-1 w-44 border-2 rounded-md outline-none transition border-neutral-300 focus:border-black"
                />
                <Button label="Generate" color="bg-green-600" type="submit" />
              </form>
            </div>
          ) : show === "Contract Expiry" ? (
            <div className="flex justify-center">
              <form onSubmit={handleExpiry} className="flex">
                <label className="w-24 text-md font-medium leading-6 text-gray-900">
                  Start Date:
                </label>
                <input
                  type="date"
                  value={expiry.startDate}
                  onChange={(e) =>
                    setExpiry((prev) => ({
                      ...prev,
                      startDate: e.target.value,
                    }))
                  }
                  className="mr-3 px-1 w-44 border-2 rounded-md outline-none transition border-neutral-300 focus:border-black"
                />
                <label className="w-20 ml-4 text-md font-medium leading-6 text-gray-900">
                  End Date:
                </label>
                <input
                  type="date"
                  value={expiry.endDate}
                  onChange={(e) =>
                    setExpiry((prev) => ({
                      ...prev,
                      endDate: e.target.value,
                    }))
                  }
                  className="mr-3 px-1 w-44 border-2 rounded-md outline-none transition border-neutral-300 focus:border-black"
                />
                <Button label="Generate" color="bg-green-600" type="submit" />
              </form>
            </div>
          ) : (
            <Bar options={options} data={data} />
          )}
        </>
      )}
    </div>
  );
};
export default Dashboard;
