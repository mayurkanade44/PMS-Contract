import { useEffect, useMemo, useState } from "react";
import { AiOutlineSearch } from "react-icons/ai";
import Select from "react-select";
import { AlertMessage, Button, Loading, ScheduleTable } from "../components";
import ScheduleFormModal from "../components/Modals/ScheduleFormModal";
import SearchClientModal from "../components/Modals/SearchClientModal";
import {
  useGetAllSchedulesQuery,
  useGetAllTechniciansQuery,
} from "../redux/scheduleSlice";
import {
  jobStatusOptions,
  pincodeOptions,
  scheduleTypes,
  serviceTypeOptions,
  timeSlot,
} from "../utils/dataHelper";

const Schedule = () => {
  const [scheduleType, setScheduleType] = useState({
    value: "all",
    label: "All",
  });
  const [jobStatus, setJobStatus] = useState({
    value: "all",
    label: "All",
  });
  const [serviceType, setServiceType] = useState({
    value: "all",
    label: "All",
  });
  const [technician, setTechnician] = useState({
    value: "all",
    label: "All",
  });
  const [time, setTime] = useState({
    value: "all",
    label: "All",
  });
  const [pincode, setPincode] = useState({
    value: "all",
    label: "All",
  });
  const [date, setDate] = useState("");
  const [tempSearch, setTempSearch] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [openSearch, setOpenSearch] = useState(false);

  const { data: technicians, isLoading: techniciansLoading } =
    useGetAllTechniciansQuery({ date: "", time: "" });

  useEffect(() => {
    console.log("ok");
    setPage(1);
  }, [scheduleType, jobStatus, serviceType, technician, time, date, pincode]);

  const {
    data,
    isLoading: schedulesLoading,
    isFetching,
    error,
  } = useGetAllSchedulesQuery({
    scheduleType: scheduleType.value,
    jobStatus: jobStatus.value,
    serviceType: serviceType.value,
    technician: technician.value,
    time: time.value,
    pincode: pincode.value,
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

  const closeSearchModal = () => {
    setOpenSearch(false);
  };

  return (
    <>
      {schedulesLoading || isFetching || techniciansLoading ? (
        <Loading />
      ) : (
        error && <AlertMessage>{error?.data?.msg || error.error}</AlertMessage>
      )}
      {openSearch && (
        <SearchClientModal
          open={openSearch}
          close={closeSearchModal}
          setOpen={setOpen}
        />
      )}
      {open && <ScheduleFormModal open={open} setOpen={setOpen} />}
      <div className="pt-1 pb-5">
        <div className="mx-auto container bg-white shadow rounded ">
          <div className="flex flex-col lg:flex-row px-8 pt-4 justify-between items-start lg:items-stretch w-full">
            <h1 className="text-xl md:text-3xl font-semibold text-center">
              Service Scheduling{" "}
            </h1>
            <div className="w-full mt-2 mb-3 lg:mt-0 lg:mb-1 lg:w-2/4 flex flex-col lg:flex-row items-center justify-end">
              <Button
                label="Add Schedule"
                height="h-8 md:h-10"
                width="w-32 md:w-40"
                color="bg-indigo-700"
                handleClick={() => setOpenSearch(true)}
              />
              {/* <button className="focus:shadow-outline-gray border border-transparent w-auto lg:w-1/4 my-2 lg:my-0 lg:ml-2 xl:ml-4 bg-green-600 transition focus:outline-none focus:border-gray-800 focus:shadow-outline-gray duration-150 ease-in-out hover:bg-green-500 rounded text-white px-6 py-2 text-sm">
                Generate Schedule
              </button> */}
            </div>
          </div>
          <div className="flex flex-col lg:flex-row px-2 mb-2 justify-between items-start lg:items-stretch w-full">
            <div className="w-full lg:w-1/6 flex flex-col lg:flex-row items-start lg:items-center">
              <div className="w-full relative mb-2 lg:mb-0 lg:mr-1 lg:mt-6">
                <div className="absolute text-gray-600 dark:text-gray-400 flex items-center pl-2 h-full">
                  <AiOutlineSearch />
                </div>
                <input
                  id="search"
                  className=" text-gray-600 focus:outline-none focus:border focus:border-indigo-700 font-normal w-full h-10 flex items-center pl-7 text-sm border-gray-300 rounded border"
                  placeholder="Contract Number / Client Name"
                  value={tempSearch}
                  onChange={handleSearch}
                />
              </div>
            </div>
            <div className="w-full lg:w-5/6 flex flex-col lg:flex-row items-start lg:items-center justify-between">
              <div className="w-full lg:w-1/5 my-2 lg:my-0 lg:mx-1">
                <label className="text-sm font-medium text-gray-900 pb-1 pl-1">
                  Schedule Type
                </label>
                <Select
                  defaultValue={scheduleType}
                  onChange={setScheduleType}
                  options={scheduleTypes}
                />
              </div>
              <div className="w-full lg:w-1/5 my-2 lg:my-0 lg:mx-1">
                <label className="text-sm font-medium text-gray-900 pb-1 pl-1">
                  Service Type
                </label>
                <Select
                  defaultValue={serviceType}
                  onChange={setServiceType}
                  options={serviceTypeOptions}
                />
              </div>
              <div className="w-full lg:w-1/5 my-2 lg:my-0 lg:mx-1 ">
                <label className="text-sm font-medium text-gray-900 pb-1 pl-1">
                  Job Status
                </label>
                <Select
                  defaultValue={jobStatus}
                  onChange={setJobStatus}
                  options={jobStatusOptions}
                />
              </div>
              <div className="w-full lg:w-1/5 my-2 lg:my-0 lg:mx-1 ">
                <label className="text-sm font-medium text-gray-900 pb-1 pl-1">
                  Pincode
                </label>
                <Select
                  defaultValue={pincode}
                  onChange={setPincode}
                  options={pincodeOptions}
                />
              </div>
              <div className="w-full lg:w-1/5 my-2 lg:my-0 lg:mx-1 ">
                <label className="text-sm font-medium text-gray-900 pb-1 pl-1">
                  Time
                </label>
                <Select
                  defaultValue={time}
                  onChange={setTime}
                  options={[{ value: "all", label: "All" }, ...timeSlot]}
                />
              </div>

              <div className=" w-full lg:w-1/5 my-2 lg:mx-1">
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
              <div className="w-full lg:w-1/5 my-2 lg:my-0 lg:mx-1">
                <label className="text-sm font-medium text-gray-900 pb-1 pl-1">
                  Technicians
                </label>
                <Select
                  defaultValue={technician}
                  onChange={setTechnician}
                  options={
                    technicians && [
                      { value: "all", label: "All" },
                      ...technicians,
                    ]
                  }
                />
              </div>
            </div>
          </div>
          <ScheduleTable
            schedules={data?.schedules}
            setOpen={setOpen}
            page={page}
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
