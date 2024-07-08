import { useMemo, useState } from "react";
import Select from "react-select";
import {
  AlertMessage,
  Loading,
  ScheduleForm,
  ScheduleTable,
} from "../components";
import { useGetAllSchedulesQuery } from "../redux/scheduleSlice";
import {
  jobStatusOptions,
  scheduleTypes,
  serviceTypeOptions,
} from "../utils/dataHelper";
import { AiOutlineSearch } from "react-icons/ai";

const Schedule = () => {
  const [scheduleType, setScheduleType] = useState({
    value: "tentative",
    label: "Tentative",
  });
  const [jobStatus, setJobStatus] = useState({
    value: "all",
    label: "All",
  });
  const [serviceType, setServiceType] = useState({
    value: "all",
    label: "All",
  });
  const [date, setDate] = useState("");
  const [tempSearch, setTempSearch] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);

  const {
    data,
    isLoading: schedulesLoading,
    isFetching,
    error,
  } = useGetAllSchedulesQuery({
    scheduleType: scheduleType.value,
    jobStatus: jobStatus.value,
    serviceType: serviceType.value,
    date,
    search,
    page,
  });

  const debounce = () => {
    let timeoutId;
    return (e) => {
      setTempSearch(e.target.value);
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setSearch(e.target.value);
      }, 1000);
    };
  };

  const handleSearch = useMemo(() => debounce(), []);

  const pages = Array.from({ length: data?.pages }, (_, index) => index + 1);

  return (
    <>
      {schedulesLoading || isFetching ? (
        <Loading />
      ) : (
        error && <AlertMessage>{error?.data?.msg || error.error}</AlertMessage>
      )}
      <div className="pt-1 pb-5">
        <div className="mx-auto container bg-white shadow rounded">
          <div className="flex flex-col lg:flex-row px-8 pt-4 justify-between items-start lg:items-stretch w-full">
            <h1 className="text-3xl font-semibold">Service Scheduling </h1>
            <div className="w-full lg:w-2/4 flex flex-col lg:flex-row items-start lg:items-center justify-end">
              <button
                className="focus:shadow-outline-gray border border-transparent w-auto lg:w-1/4 my-2 lg:my-0 lg:ml-2 xl:ml-4 bg-indigo-700 transition focus:outline-none focus:border-gray-800 focus:shadow-outline-gray duration-150 ease-in-out hover:bg-indigo-600 rounded text-white px-6 py-2 text-sm"
                onClick={() => setOpen(true)}
              >
                Add Schedule
              </button>
              <ScheduleForm open={open} setOpen={setOpen} />
              <button className="focus:shadow-outline-gray border border-transparent w-auto lg:w-1/4 my-2 lg:my-0 lg:ml-2 xl:ml-4 bg-green-600 transition focus:outline-none focus:border-gray-800 focus:shadow-outline-gray duration-150 ease-in-out hover:bg-green-500 rounded text-white px-6 py-2 text-sm">
                Generate Report
              </button>
            </div>
          </div>
          <div className="flex flex-col lg:flex-row px-8 justify-between items-start lg:items-stretch w-full">
            <div className="w-full lg:w-1/4 flex flex-col lg:flex-row items-start lg:items-center">
              <div className="w-full relative mb-2 lg:mb-0 lg:mr-4 lg:mt-6">
                <div className="absolute text-gray-600 dark:text-gray-400 flex items-center pl-3 h-full">
                  <AiOutlineSearch />
                </div>
                <input
                  id="search"
                  className=" text-gray-600 focus:outline-none focus:border focus:border-indigo-700 font-normal w-full h-10 flex items-center pl-10 text-sm border-gray-300  rounded border"
                  placeholder="Contract Number"
                  value={tempSearch}
                  onChange={handleSearch}
                />
              </div>
            </div>
            <div className="w-full lg:w-3/4 flex flex-col lg:flex-row items-start lg:items-center justify-between">
              <div className="w-full lg:w-1/4 my-2 lg:my-0 lg:mx-2 xl:mx-4">
                <label className="text-sm font-medium text-gray-900 pb-1 pl-1">
                  Schedule Type
                </label>
                <Select
                  defaultValue={scheduleType}
                  onChange={setScheduleType}
                  options={scheduleTypes}
                />
              </div>
              <div className="w-full lg:w-1/4 my-2 lg:my-0 lg:mx-2 xl:mx-4 ">
                <label className="text-sm font-medium text-gray-900 pb-1 pl-1">
                  Service Type
                </label>
                <Select
                  defaultValue={serviceType}
                  onChange={setServiceType}
                  options={serviceTypeOptions}
                />
              </div>
              <div className="w-full lg:w-1/4 my-2 lg:my-0 lg:mx-2 xl:mx-4 ">
                <label className="text-sm font-medium text-gray-900 pb-1 pl-1">
                  Job Status
                </label>
                <Select
                  defaultValue={jobStatus}
                  onChange={setJobStatus}
                  options={jobStatusOptions}
                />
              </div>
              <div className=" w-full lg:w-1/4 my-5 lg:mx-2 xl:mx-4">
                <label className="text-sm font-medium text-gray-900 pb-1 pl-1">
                  Schedule Date
                </label>
                <input
                  type="date"
                  className="w-full border border-gray-400 py-1 px-2 rounded"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
            </div>
          </div>
          <ScheduleTable
            schedules={data?.schedules}
            isLoading={schedulesLoading}
            setOpen={setOpen}
          />
        </div>
        <div className="mx-auto container pt-6 flex justify-center items-center">
          {pages.length > 1 && (
            <nav className="">
              <ul className="list-style-none flex justify-center">
                {pages.map((item) => (
                  <li className="pr-1" key={item}>
                    <button
                      className={`relative block rounded px-3 py-1.5 text-sm transition-all duration-30  ${
                        page === item ? "bg-blue-400" : "bg-neutral-700"
                      } text-white hover:bg-blue-400`}
                      onClick={() => setPage(item)}
                    >
                      {item}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          )}
        </div>
      </div>
    </>
  );
};
export default Schedule;
