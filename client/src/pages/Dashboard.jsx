import { useDailyServicesQuery } from "../redux/reportSlice";

const Dashboard = () => {
  const { data: dailyServices, isLoading: dailyLoading } =
    useDailyServicesQuery();

  return <div className="my-5">Dashboard</div>;
};
export default Dashboard;
